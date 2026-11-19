(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ResolveModel = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = 1;
  const clone = value => JSON.parse(JSON.stringify(value));
  const sum = values => values.reduce((a, b) => a + b, 0);
  const knownSum = values => values.some(v => v === null) ? null : sum(values);
  const difference = (a, b) => a === null || b === null ? null : a - b;
  const cost = (quantity, price) => quantity === 0 ? 0 : price === null ? null : quantity * price;
  const near = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
  function blankScenario() {
    return {schemaVersion:VERSION, name:'Your estimate', currency:'EUR', years:5,
      groups:[], recoveryUnits:[], factors:[], transport:[], labour:[], ppe:[],
      disposal:{baselineFixedFee:0, projectFixedFee:0, baselineMinimumCharge:0, projectMinimumCharge:0},
      sharedCosts:{installation:0, qualification:0, training:0, otherOneOff:0, annualMaintenance:0, annualConsumables:0}};
  }
  function exampleScenario() {
    const s = blankScenario();
    s.name = 'Example scenario · editable laboratory inputs';
    s.groups = [{id:'example-group', name:'Example HPLC', deviceCount:1, mode:'direct', schedule:null, methods:[{
      id:'example-method', name:'Illustrative eligible isocratic method',
      direct:{litres:350, period:'month', basis:'per-device'}, flow:null, eligibleFraction:1,
      recovery:{fraction:0.85, lossesIncluded:false, topUpLitres:0, purgeLitres:0, additionalWasteLitres:0},
      baselineWasteFraction:1, composition:{basis:'vv', blendDensityKgPerL:null,
        components:[{id:'mobile-phase', name:'Unspecified mobile-phase blend', fraction:1,
          densityKgPerL:null, pricePerL:null, productionFactorId:null, wasteFactorId:null}]},
      pricing:{mode:'blend', pricePerL:24}, waste:{pricePerL:8, factorId:null}
    }]}];
    s.recoveryUnits = [{id:'example-unit', name:'Recovery unit — quote required', quantity:1, unitPrice:null,
      allocation:{mode:'dedicated',groupIds:['example-group'],note:''}, annualMaintenanceCost:0,
      annualConsumablesCost:0,annualElectricityKWh:0,electricityPricePerKWh:null,
      electricityFactorId:null,capitalFactorId:null}];
    return s;
  }
  function calculate(input) {
    try { return calculateValidated(input); }
    catch (_) { return {ok:false,errors:[{path:'scenario',code:'schema',message:'The scenario contains malformed fields. Check its structure against the model schema.'}],warnings:[],results:null}; }
  }
  function calculateValidated(input) {
    const errors = [], warnings = [], emissionEntries = [];
    const err = (path, code, message) => errors.push({path,code,message});
    const warn = (path, code, message) => warnings.push({path,code,message});
    const number = (v, path, min = 0, max = 1e15, nullable = false, integer = false) => {
      if ((v === null || v === undefined || v === '') && nullable) return null;
      if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max || (integer && !Number.isInteger(v))) {
        err(path, 'numeric-range', `Enter a finite ${integer ? 'whole ' : ''}number from ${min} to ${max}.`); return 0;
      }
      return v;
    };
    const choice = (v, list, path) => { if (!list.includes(v)) err(path,'choice',`Choose ${list.join(' or ')}.`); return v; };
    const list = (v, path) => { if (!Array.isArray(v)) {err(path,'array','An array is required.'); return [];} return v; };
    const str = (v, path) => {if(typeof v !== 'string' || !v.trim()) err(path,'required','A nonempty name or identifier is required.'); return typeof v === 'string' ? v : '';};
    const ids = new Set();
    const id = (v, path) => {str(v,path); if(ids.has(v)) err(path,'duplicate-id','Identifiers must be unique throughout this scenario.'); ids.add(v); return v;};
    if (!input || typeof input !== 'object' || Array.isArray(input)) return {ok:false, errors:[{path:'scenario',code:'object',message:'Provide a scenario object.'}], warnings, results:null};
    const s = input;
    if (s.schemaVersion !== VERSION) err('schemaVersion','version','This model requires schemaVersion 1.');
    if (typeof s.currency !== 'string' || !/^[A-Z]{3}$/.test(s.currency)) err('currency','currency','Use a three-letter currency code; no exchange conversion is performed.');
    const years = number(s.years,'years',1,50,false,true);
    const factorMap = new Map();
    list(s.factors,'factors').forEach((f,i) => {
      const p = `factors[${i}]`;
      if(!f || typeof f !== 'object') {err(p,'object','Factor must be an object.'); return;}
      id(f.id,`${p}.id`);
      const value = number(f.value,`${p}.value`,0,1e12,true);
      choice(f.unit,['kgCO2e/kg','kgCO2e/L','kgCO2e/item','kgCO2e/kWh','kgCO2e/tkm'],`${p}.unit`);
      const stages = list(f.includedStages,`${p}.includedStages`);
      stages.forEach((x,j)=>choice(x,['production','transport','waste-treatment','waste-transport','capital','electricity'],`${p}.includedStages[${j}]`));
      if(value !== null) {
        ['geography','sourceUrl','lifecycleBoundary','dataQualityNote'].forEach(k=>{if(typeof f[k] !== 'string' || !f[k].trim()) warn(`${p}.${k}`,'factor-provenance','Factor provenance is incomplete; retain this limitation in exports.');});
        if(f.year === null || f.year === undefined) warn(`${p}.year`,'factor-provenance','Factor year is not supplied.');
        else number(f.year,`${p}.year`,1900,2200,false,true);
        if(!stages.length) err(`${p}.includedStages`,'factor-boundary','Declare the lifecycle stages covered by this factor.');
      }
      factorMap.set(f.id,{...f,value,includedStages:stages});
    });
    function factor(factorId,path) {
      if(factorId === null || factorId === undefined || factorId === '') return null;
      if(!factorMap.has(factorId)) {err(path,'factor-reference','Referenced factor does not exist.'); return null;}
      return factorMap.get(factorId);
    }
    function emission({id:entryId,name,category,scope='3',factorId,baseline,project,path,requiredStage,allowedStages}) {
      const f = factor(factorId,path);
      let reason = null, baseKg = null, projectKg = null;
      if(!f || f.value === null) reason = 'Emission factor not supplied';
      else {
        if(!f.includedStages.includes(requiredStage) || f.includedStages.some(x=>!allowedStages.includes(x))) err(path,'factor-boundary',`This activity needs a ${requiredStage} factor with only these stages: ${allowedStages.join(', ')}.`);
        const unit = f.unit.split('/')[1];
        if(!Object.prototype.hasOwnProperty.call(baseline,unit) || !Object.prototype.hasOwnProperty.call(project,unit)) err(path,'factor-unit',`Factor unit ${f.unit} does not match this activity.`);
        else if(baseline[unit] === null || project[unit] === null) reason = `Required ${unit} activity or density is not supplied`;
        else {baseKg = baseline[unit] * f.value; projectKg = project[unit] * f.value;}
      }
      const e = {id:entryId,name,category,scope,factorId:factorId || null,
        baselineQuantity:baseline,projectQuantity:project,baselineKg:baseKg,projectKg,
        reductionKg:difference(baseKg,projectKg),status:reason ? 'not-estimated' : 'estimated',reason};
      emissionEntries.push(e); return e;
    }
    function unquantifiedPurchase(entryId,name) {
      emissionEntries.push({id:entryId,name,category:'1',scope:'3',factorId:null,
        baselineQuantity:{item:0},projectQuantity:{item:null},baselineKg:null,projectKg:null,reductionKg:null,
        status:'not-estimated',reason:'Only a financial amount is supplied; a matching physical/service activity and emission factor are needed.'});
    }
    const groupIds = new Set(), methodMap = new Map();
    const groups = list(s.groups,'groups').map((g,gi)=> {
      const gp=`groups[${gi}]`;
      if(!g || typeof g !== 'object') {err(gp,'object','Group must be an object.'); return null;}
      id(g.id,`${gp}.id`); groupIds.add(g.id); str(g.name,`${gp}.name`);
      const quantity = number(g.deviceCount,`${gp}.deviceCount`,1,100000,false,true);
      choice(g.mode,['direct','flow'],`${gp}.mode`);
      let hours=0, days=0;
      if(g.mode === 'flow') {
        hours=number(g.schedule?.hoursPerDay,`${gp}.schedule.hoursPerDay`,0,24);
        days=number(g.schedule?.daysPerYear,`${gp}.schedule.daysPerYear`,0,366);
      }
      let timeShareTotal=0;
      const methods=list(g.methods,`${gp}.methods`).map((m,mi)=> {
        const p=`${gp}.methods[${mi}]`;
        if(!m || typeof m !== 'object') {err(p,'object','Method must be an object.'); return null;}
        id(m.id,`${p}.id`);str(m.name,`${p}.name`);
        let throughput=0;
        if(g.mode==='direct') {
          if(m.flow !== undefined && m.flow !== null) err(`${p}.flow`,'exclusive-mode','Remove flow inputs when direct consumption is selected.');
          const litres=number(m.direct?.litres,`${p}.direct.litres`,0,1e12);
          choice(m.direct?.period,['month','year'],`${p}.direct.period`);
          choice(m.direct?.basis,['per-device','group'],`${p}.direct.basis`);
          throughput=litres*(m.direct?.period==='month'?12:1)*(m.direct?.basis==='per-device'?quantity:1);
        } else if(g.mode==='flow') {
          if(m.direct !== undefined && m.direct !== null) err(`${p}.direct`,'exclusive-mode','Remove direct inputs when flow consumption is selected.');
          const flow=number(m.flow?.mlPerMinute,`${p}.flow.mlPerMinute`,0,1e6);
          const share=number(m.flow?.timeShare,`${p}.flow.timeShare`,0,1);
          timeShareTotal+=share; throughput=quantity*flow*60*hours*days*share/1000;
        }
        const eligibility=number(m.eligibleFraction,`${p}.eligibleFraction`,0,1);
        const r=m.recovery||{};
        const recovery=number(r.fraction,`${p}.recovery.fraction`,0,1);
        if(typeof r.lossesIncluded !== 'boolean') err(`${p}.recovery.lossesIncluded`,'boolean','Specify whether the recovery fraction already includes losses.');
        const topup=number(r.topUpLitres,`${p}.recovery.topUpLitres`,0,1e12);
        const purge=number(r.purgeLitres,`${p}.recovery.purgeLitres`,0,1e12);
        const additionalWaste=number(r.additionalWasteLitres,`${p}.recovery.additionalWasteLitres`,0,1e12);
        if(r.lossesIncluded && (topup!==0 || purge!==0)) err(`${p}.recovery`,'double-counted-loss','Top-up and purge must be zero when the recovery fraction already includes those losses.');
        const eligible=throughput*eligibility, reportedRecovered=eligible*recovery;
        const usable=reportedRecovered-topup-purge;
        const baselineWasteFraction=number(m.baselineWasteFraction,`${p}.baselineWasteFraction`,0,1);
        const baselineWaste=throughput*baselineWasteFraction;
        const projectFresh=throughput-usable;
        const projectWaste=baselineWaste-reportedRecovered+purge+additionalWaste;
        if(projectWaste < -1e-9) err(`${p}.baselineWasteFraction`,'negative-waste','Recovered return exceeds the baseline disposed stream after declared additions; revise the waste balance.');
        const safeProjectWaste=Math.max(0,projectWaste);
        const composition=m.composition||{};
        choice(composition.basis,['vv','ww'],`${p}.composition.basis`);
        const blendDensity=number(composition.blendDensityKgPerL,`${p}.composition.blendDensityKgPerL`,0.000001,30,true);
        if(composition.basis==='ww' && blendDensity===null) err(`${p}.composition.blendDensityKgPerL`,'density-required','A w/w blend requires an explicitly supplied blend density.');
        const components=list(composition.components,`${p}.composition.components`);
        if(!components.length) err(`${p}.composition.components`,'composition-required','Enter at least one component, including an explicitly unspecified blend if composition is unknown.');
        let totalFraction=0;
        const calculatedComponents=components.map((c,ci)=> {
          const cp=`${p}.composition.components[${ci}]`;
          if(!c || typeof c !== 'object') {err(cp,'object','Component must be an object.');return null;}
          // Component IDs need only be unique within a method, allowing repeated water across methods.
          str(c.id,`${cp}.id`); str(c.name,`${cp}.name`);
          if(components.slice(0,ci).some(other=>other?.id===c.id)) err(`${cp}.id`,'duplicate-id','Component IDs must be unique within a method.');
          const fraction=number(c.fraction,`${cp}.fraction`,0,1);totalFraction+=fraction;
          const density=number(c.densityKgPerL,`${cp}.densityKgPerL`,0.000001,30,true);
          if(composition.basis==='ww' && density===null) err(`${cp}.densityKgPerL`,'density-required','Each w/w component needs a density for volume conversion.');
          const amount=volume=> {
            if(composition.basis==='ww') {
              const kg=volume*(blendDensity||0)*fraction;
              return {L:density===null?null:kg/density,kg};
            }
            const L=volume*fraction; return {L,kg:L===0?0:density===null?null:L*density};
          };
          const baseline=amount(throughput),project=amount(projectFresh),baselineDisposed=amount(baselineWaste),projectDisposed=amount(safeProjectWaste);
          const price=number(c.pricePerL,`${cp}.pricePerL`,0,1e9,true);
          emission({id:`${m.id}:${c.id}:production`,name:`${g.name} / ${m.name} / ${c.name} production`,category:'1',
            factorId:c.productionFactorId,baseline,project,path:`${cp}.productionFactorId`,requiredStage:'production',allowedStages:['production','transport']});
          if(!m.waste?.factorId) emission({id:`${m.id}:${c.id}:waste`,name:`${g.name} / ${m.name} / ${c.name} waste treatment`,category:'5',
            factorId:c.wasteFactorId,baseline:baselineDisposed,project:projectDisposed,path:`${cp}.wasteFactorId`,requiredStage:'waste-treatment',allowedStages:['waste-treatment','waste-transport']});
          else if(c.wasteFactorId) err(`${cp}.wasteFactorId`,'double-counted-waste','Choose either blend waste treatment or component waste treatment, not both.');
          return {id:c.id,name:c.name,fraction,densityKgPerL:density,baseline,project,baselineDisposed,projectDisposed,
            productionFactorId:c.productionFactorId||null,wasteFactorId:c.wasteFactorId||null,
            baselinePurchaseCost:baseline.L===null?null:cost(baseline.L,price),projectPurchaseCost:project.L===null?null:cost(project.L,price)};
        }).filter(Boolean);
        if(!near(totalFraction,1)) err(`${p}.composition.components`,'blend-total','Component fractions must sum to 1 (100%).');
        if(composition.basis==='ww') warn(`${p}.composition`,'mixture-volume','w/w component equivalent volumes are calculated with supplied densities; they need not sum to the blend volume because mixing can change volume.');
        const wasteDensity=blendDensity!==null?blendDensity:
          composition.basis==='vv'?knownSum(calculatedComponents.map(c=>c.fraction===0?0:c.densityKgPerL===null?null:c.fraction*c.densityKgPerL)):null;
        if(m.waste?.factorId) emission({id:`${m.id}:blend-waste`,name:`${g.name} / ${m.name} blend waste treatment`,category:'5',factorId:m.waste.factorId,
          baseline:{L:baselineWaste,kg:baselineWaste===0?0:wasteDensity===null?null:baselineWaste*wasteDensity},
          project:{L:safeProjectWaste,kg:safeProjectWaste===0?0:wasteDensity===null?null:safeProjectWaste*wasteDensity},
          path:`${p}.waste.factorId`,requiredStage:'waste-treatment',allowedStages:['waste-treatment','waste-transport']});
        choice(m.pricing?.mode,['blend','components'],`${p}.pricing.mode`);
        const blendPrice=number(m.pricing?.pricePerL,`${p}.pricing.pricePerL`,0,1e9,true);
        const baselinePurchase=m.pricing?.mode==='components'?knownSum(calculatedComponents.map(c=>c.baselinePurchaseCost)):cost(throughput,blendPrice);
        const projectPurchase=m.pricing?.mode==='components'?knownSum(calculatedComponents.map(c=>c.projectPurchaseCost)):cost(projectFresh,blendPrice);
        const disposalPrice=number(m.waste?.pricePerL,`${p}.waste.pricePerL`,0,1e9,true);
        const material={throughputLitres:throughput,eligibleLitres:eligible,reportedRecoveredLitres:reportedRecovered,
          grossRecoveredLitres:r.lossesIncluded?null:reportedRecovered,usableRecoveredLitres:Math.max(0,usable),
          topUpLitres:topup,purgeLitres:purge,additionalWasteLitres:additionalWaste,
          baselineFreshLitres:throughput,projectFreshLitres:projectFresh,freshAvoidedLitres:usable,
          baselineWasteLitres:baselineWaste,projectWasteLitres:safeProjectWaste,wasteAvoidedLitres:baselineWaste-safeProjectWaste};
        const financial={baselinePurchaseCost:baselinePurchase,projectPurchaseCost:projectPurchase,purchaseSavings:difference(baselinePurchase,projectPurchase),
          baselineVariableDisposalCost:cost(baselineWaste,disposalPrice),projectVariableDisposalCost:cost(safeProjectWaste,disposalPrice)};
        financial.variableDisposalSavings=difference(financial.baselineVariableDisposalCost,financial.projectVariableDisposalCost);
        const output={id:m.id,name:m.name,recoveryBasis:r.lossesIncluded?'net-including-losses':'gross-before-losses',material,financial,components:calculatedComponents};
        methodMap.set(m.id,{source:m,result:output,path:p}); return output;
      }).filter(Boolean);
      if(g.mode==='flow' && timeShareTotal>1+1e-9) err(`${gp}.methods`,'overallocated-hours','Method time shares exceed the available instrument schedule.');
      if(g.mode==='flow' && timeShareTotal<1-1e-9) warn(`${gp}.methods`,'unallocated-hours','Unallocated instrument operating hours are excluded from throughput.');
      if(!methods.length) err(`${gp}.methods`,'methods-required','An instrument group requires at least one method.');
      return {id:g.id,name:g.name,deviceCount:quantity,mode:g.mode,methods,material:sumFields(methods.map(m=>m.material)),financial:sumFields(methods.map(m=>m.financial))};
    }).filter(Boolean);
    const material=groups.length?sumFields(groups.map(g=>g.material)):emptyMaterial();
    const financialBase=groups.length?sumFields(groups.map(g=>g.financial)):{baselinePurchaseCost:0,projectPurchaseCost:0,purchaseSavings:0,baselineVariableDisposalCost:0,projectVariableDisposalCost:0,variableDisposalSavings:0};
    const d=s.disposal||{};
    const disposalCharge=(side,variable)=> {
      const fixed=number(d[`${side}FixedFee`],`disposal.${side}FixedFee`,0,1e15,true);
      const minimum=number(d[`${side}MinimumCharge`],`disposal.${side}MinimumCharge`,0,1e15,true);
      return variable===null||fixed===null||minimum===null?null:Math.max(variable+fixed,minimum);
    };
    const baselineDisposal=disposalCharge('baseline',financialBase.baselineVariableDisposalCost),projectDisposal=disposalCharge('project',financialBase.projectVariableDisposalCost);
    const allocations = new Map();
    const units=list(s.recoveryUnits,'recoveryUnits').map((u,ui)=> {
      const p=`recoveryUnits[${ui}]`;
      if(!u || typeof u!=='object') {err(p,'object','Recovery unit must be an object.');return null;}
      id(u.id,`${p}.id`);str(u.name,`${p}.name`);
      const quantity=number(u.quantity,`${p}.quantity`,1,100000,false,true);
      const price=number(u.unitPrice,`${p}.unitPrice`,0,1e12,true);
      choice(u.allocation?.mode,['dedicated','scheduled-nonoverlapping','user-confirmed'],`${p}.allocation.mode`);
      const allocated=list(u.allocation?.groupIds,`${p}.allocation.groupIds`);
      let devices=0;
      allocated.forEach((gid,ai)=> {
        if(!groupIds.has(gid)) err(`${p}.allocation.groupIds[${ai}]`,'group-reference','Allocated instrument group does not exist.');
        else devices+=groups.find(g=>g.id===gid).deviceCount;
        if(allocations.has(gid)) err(`${p}.allocation.groupIds[${ai}]`,'duplicate-allocation','Each group must have one explicit recovery-unit allocation; split it into separate groups if required.');
        allocations.set(gid,u.id);
      });
      if(u.allocation?.mode==='dedicated' && devices>quantity) err(`${p}.allocation`,'insufficient-units','Dedicated recovery-unit quantity is smaller than the allocated instrument count.');
      if(u.allocation?.mode!=='dedicated') {
        str(u.allocation?.note,`${p}.allocation.note`);
        warn(`${p}.allocation`,'allocation-confirmation','Sharing depends on the declared nonoverlapping schedule or separately confirmed configuration; this calculator does not verify hardware capability.');
      }
      const maintenance=number(u.annualMaintenanceCost,`${p}.annualMaintenanceCost`,0,1e12,true);
      const consumables=number(u.annualConsumablesCost,`${p}.annualConsumablesCost`,0,1e12,true);
      if(maintenance===null||maintenance>0) unquantifiedPurchase(`${u.id}:maintenance`,`${u.name} maintenance services/parts`);
      if(consumables===null||consumables>0) unquantifiedPurchase(`${u.id}:consumables`,`${u.name} additional consumables`);
      const kWh=number(u.annualElectricityKWh,`${p}.annualElectricityKWh`,0,1e12);
      const electricityPrice=number(u.electricityPricePerKWh,`${p}.electricityPricePerKWh`,0,1e6,true);
      if(kWh>0 || u.electricityFactorId) emission({id:`${u.id}:electricity`,name:`${u.name} purchased electricity`,category:'electricity',scope:'2',factorId:u.electricityFactorId,
        baseline:{kWh:0},project:{kWh:kWh*quantity},path:`${p}.electricityFactorId`,requiredStage:'electricity',allowedStages:['electricity']});
      emission({id:`${u.id}:capital`,name:`${u.name} acquisition-year embodied emissions`,category:'2',factorId:u.capitalFactorId,
        baseline:{item:0},project:{item:quantity},path:`${p}.capitalFactorId`,requiredStage:'capital',allowedStages:['capital']});
      return {id:u.id,name:u.name,quantity,investment:cost(quantity,price),maintenanceCost:cost(quantity,maintenance),consumablesCost:cost(quantity,consumables),
        electricityKWh:kWh*quantity,electricityCost:cost(kWh*quantity,electricityPrice)};
    }).filter(Boolean);
    groups.forEach(g=> {if(g.material.reportedRecoveredLitres>0&&!allocations.has(g.id)) warn(`groups.${g.id}`,'allocation-missing','No recovery-unit allocation is supplied; investment and payback remain uncalculated.');});
    function checkGroup(value,path) {if(value!==null&&value!==undefined&&!groupIds.has(value)) err(path,'group-reference','Referenced group does not exist.');}
    function events(row,side,path) {
      const x=row[side]||{};
      if(x.eventDerivation!==undefined&&x.eventDerivation!==null) {
        if(x.events!==null&&x.events!==undefined) err(`${path}.events`,'duplicate-events','Use entered events or derived events, not both.');
        const deriv=x.eventDerivation;
        choice(deriv.material,['fresh','waste'],`${path}.eventDerivation.material`);
        choice(deriv.convention,['ceil-volume-over-capacity'],`${path}.eventDerivation.convention`);
        checkGroup(deriv.groupId,`${path}.eventDerivation.groupId`);
        const capacity=number(deriv.capacityLitres,`${path}.eventDerivation.capacityLitres`,0.000001,1e9);
        const source=deriv.groupId?groups.find(g=>g.id===deriv.groupId)?.material:material;
        const vol=source?.[`${side}${deriv.material==='fresh'?'Fresh':'Waste'}Litres`]||0;
        return capacity===0?0:Math.ceil(vol/capacity);
      }
      return number(x.events,`${path}.events`,0,1e12);
    }
    const labourKeys=new Set(),ppeKeys=new Set();
    function uniqueActivity(row,keys,path) {
      const key=`${row.groupId||'laboratory'}:${String(row.name||'').trim().replace(/\s+/g,' ').toLowerCase()}`;
      if(keys.has(key)) err(path,'duplicate-activity','This named activity/item is already included for the same group. Combine its events or give distinct activities specific names.');
      keys.add(key);
    }
    const labourRows=list(s.labour,'labour').map((row,i)=> {
      const p=`labour[${i}]`;
      if(!row||typeof row!=='object') {err(p,'object','Labour activity must be an object.');return null;}
      id(row.id,`${p}.id`);str(row.name,`${p}.name`);checkGroup(row.groupId,`${p}.groupId`);
      uniqueActivity(row,labourKeys,p);
      const hours=side=>events(row,side,`${p}.${side}`)*number(row[side]?.minutesPerEvent,`${p}.${side}.minutesPerEvent`,0,100000)*number(row[side]?.people,`${p}.${side}.people`,0,100000)/60;
      const baselineHours=hours('baseline'),projectHours=hours('project'),released=baselineHours-projectHours;
      const rate=number(row.hourlyRate,`${p}.hourlyRate`,0,1e9,true);
      return {id:row.id,name:row.name,groupId:row.groupId||null,baselineHours,projectHours,hoursReleased:released,capacityValue:cost(released,rate)};
    }).filter(Boolean);
    const ppeRows=list(s.ppe,'ppe').map((row,i)=> {
      const p=`ppe[${i}]`;
      if(!row||typeof row!=='object') {err(p,'object','PPE activity must be an object.');return null;}
      id(row.id,`${p}.id`);str(row.name,`${p}.name`);checkGroup(row.groupId,`${p}.groupId`);
      uniqueActivity(row,ppeKeys,p);
      const amount=side=>events(row,side,`${p}.${side}`)*number(row[side]?.itemsPerEvent,`${p}.${side}.itemsPerEvent`,0,1e9);
      const baselineItems=amount('baseline'),projectItems=amount('project'),price=number(row.unitCost,`${p}.unitCost`,0,1e9,true);
      emission({id:`${row.id}:ppe`,name:row.name,category:'1',factorId:row.factorId,baseline:{item:baselineItems},project:{item:projectItems},
        path:`${p}.factorId`,requiredStage:'production',allowedStages:['production']});
      const baselineCost=cost(baselineItems,price),projectCost=cost(projectItems,price);
      return {id:row.id,name:row.name,groupId:row.groupId||null,baselineItems,projectItems,baselineCost,projectCost,savings:difference(baselineCost,projectCost)};
    }).filter(Boolean);
    list(s.transport,'transport').forEach((t,i)=> {
      const p=`transport[${i}]`;
      if(!t||typeof t!=='object') {err(p,'object','Transport must be an object.');return;}
      id(t.id,`${p}.id`);str(t.name,`${p}.name`);choice(t.category,['4','5'],`${p}.category`);choice(t.unit,['kg','L','item','tkm'],`${p}.unit`);
      str(t.boundaryNote,`${p}.boundaryNote`);
      if(t.includedElsewhere!==false) err(`${p}.includedElsewhere`,'transport-overlap','Separate transport may be included only after confirming it is not already counted.');
      const cover=list(t.coversMethodIds,`${p}.coversMethodIds`);
      if(!cover.length) err(`${p}.coversMethodIds`,'transport-scope','Identify the methods covered by this transport activity.');
      cover.forEach((mid,j)=> {
        const m=methodMap.get(mid);
        if(!m) {err(`${p}.coversMethodIds[${j}]`,'method-reference','Covered method does not exist.');return;}
        const target=t.category==='4'?'transport':'waste-transport';
        const refs=t.category==='4'?m.source.composition.components.map(c=>c.productionFactorId):[m.source.waste.factorId,...m.source.composition.components.map(c=>c.wasteFactorId)];
        if(refs.some(fid=>factorMap.get(fid)?.includedStages.includes(target))) err(`${p}.coversMethodIds[${j}]`,'transport-overlap','Transport is already included in a factor covering this method.');
      });
      const baseline=number(t.baselineQuantity,`${p}.baselineQuantity`,0,1e15),project=number(t.projectQuantity,`${p}.projectQuantity`,0,1e15);
      emission({id:t.id,name:t.name,category:t.category,factorId:t.factorId,baseline:{[t.unit]:baseline},project:{[t.unit]:project},path:`${p}.factorId`,
        requiredStage:t.category==='4'?'transport':'waste-transport',allowedStages:[t.category==='4'?'transport':'waste-transport']});
    });
    const shared=s.sharedCosts||{};
    const sharedCapital=knownSum(['installation','qualification','training','otherOneOff'].map(k=>number(shared[k],`sharedCosts.${k}`,0,1e15,true)));
    const sharedAnnual=knownSum(['annualMaintenance','annualConsumables'].map(k=>number(shared[k],`sharedCosts.${k}`,0,1e15,true)));
    if(shared.annualMaintenance===null||shared.annualMaintenance>0) unquantifiedPurchase('shared:maintenance','Shared maintenance services/parts');
    if(shared.annualConsumables===null||shared.annualConsumables>0) unquantifiedPurchase('shared:consumables','Shared additional consumables');
    const allocationMissing=groups.some(g=>g.material.reportedRecoveredLitres>0&&!allocations.has(g.id));
    const investment=allocationMissing?null:knownSum([sharedCapital,...units.map(u=>u.investment)]);
    const running=knownSum([sharedAnnual,...units.flatMap(u=>[u.maintenanceCost,u.consumablesCost,u.electricityCost])]);
    const ppe={rows:ppeRows,baselineCost:knownSum(ppeRows.map(r=>r.baselineCost)),projectCost:knownSum(ppeRows.map(r=>r.projectCost)),savings:knownSum(ppeRows.map(r=>r.savings))};
    const labour={rows:labourRows,baselineHours:sum(labourRows.map(r=>r.baselineHours)),projectHours:sum(labourRows.map(r=>r.projectHours)),hoursReleased:sum(labourRows.map(r=>r.hoursReleased)),capacityValue:knownSum(labourRows.map(r=>r.capacityValue))};
    const purchaseSavings=financialBase.purchaseSavings,disposalSavings=difference(baselineDisposal,projectDisposal);
    const gross=knownSum([purchaseSavings,disposalSavings]);
    const net=gross===null||ppe.savings===null||running===null?null:gross+ppe.savings-running;
    const financial={...financialBase,baselineDisposalCost:baselineDisposal,projectDisposalCost:projectDisposal,disposalSavings,
      grossPurchaseDisposalSavings:gross,ppeSavings:ppe.savings,additionalAnnualRunningCosts:running,netAnnualCashBenefit:net,
      baselineAnnualCost:knownSum([financialBase.baselinePurchaseCost,baselineDisposal,ppe.baselineCost]),
      projectAnnualCost:knownSum([financialBase.projectPurchaseCost,projectDisposal,ppe.projectCost,running])};
    let payback;
    if(net===null) payback={status:'costs-incomplete',years:null,message:'Enter the missing operating prices to calculate net cash benefit.'};
    else if(net<=0) payback={status:'no-payback',years:null,message:'No payback under these assumptions'};
    else if(investment===null) payback={status:'quote-required',years:null,message:'Request pricing or enter your quote to calculate payback.'};
    else payback={status:'calculated',years:investment/net,message:'Simple cash payback; excludes labour capacity value.'};
    const cumulativeCash=investment===null||net===null?null:Array.from({length:years+1},(_,year)=>({year,cumulativeCash:-investment+year*net}));
    const categories={};
    ['1','4','5','2'].forEach(cat=>categories[cat]=aggregateEmissions(emissionEntries.filter(e=>e.scope==='3'&&e.category===cat)));
    const recurringEntries=emissionEntries.filter(e=>e.scope==='3'&&e.category!=='2');
    const scope3Recurring=aggregateEmissions(recurringEntries);
    const scope3AcquisitionYear=aggregateEmissions(emissionEntries.filter(e=>e.scope==='3'));
    const scope2=aggregateEmissions(emissionEntries.filter(e=>e.scope==='2'));
    const wider=aggregateEmissions([...recurringEntries,...emissionEntries.filter(e=>e.scope==='2')]);
    const results={schemaVersion:VERSION,name:typeof s.name==='string'?s.name:'',currency:s.currency,groups,recoveryUnits:units,
      totals:{material,financial,labour,ppe,investment,payback,cumulativeCash,electricityKWh:sum(units.map(u=>u.electricityKWh))},
      emissions:{categories,scope3Recurring,scope3AcquisitionYear,scope2,widerAnnualOperationalComparison:wider,entries:emissionEntries,
        coverage:{recurring:scope3Recurring.status,capital:categories['2'].status,electricity:scope2.status},
        exclusions:['No unentered activities are estimated.','PPE disposal is outside the liquid-waste treatment model.','Installation, qualification and training emissions are not inferred from their monetary cost.'],
        boundary:'Selected instruments and activities only. Recurring Scope 3 excludes acquisition-year capital and purchased electricity; estimates are not offsets or verified reporting.'},
      assumptions:[
        'Annual throughput is treated as baseline fresh demand; circulating return is credited once, never as repeated reservoir savings.',
        'Recovered material and declared losses use the entered mobile-phase composition; composition changes require separate method or waste-stream modelling.',
        'v/v component volumes are allocated from entered blend volume. If no measured blend density is entered, liquid-waste mass is approximated from the volume-weighted component densities.',
        'Top-up, purge and additional waste are whole-group annual amounts; recovery-unit running costs and energy are per unit.',
        'Disposal total is the greater of variable plus fixed charges and the entered minimum charge.',
        'Empty PPE/labour lists and explicitly zero costs mean these activities/costs are excluded or assumed zero, not proven absent.',
        'Labour time is capacity value, excluded from cash payback and all emissions.',
        'Prices and emission factors are user inputs; no performance, compatibility, quote or carbon factor is supplied by this model.'
      ]};
    function finiteWalk(value,path) {if(typeof value==='number'&&!Number.isFinite(value)) err(path,'numeric-overflow','Calculation exceeds the supported numeric range; revise inputs.');else if(value&&typeof value==='object') Object.entries(value).forEach(([k,v])=>finiteWalk(v,`${path}.${k}`));}
    finiteWalk(results,'results');
    return {ok:errors.length===0,errors,warnings,results:errors.length?null:results};
  }
  function sumFields(objects) {
    const keys=Object.keys(objects[0]||{}), result={};
    keys.forEach(k=>result[k]=knownSum(objects.map(o=>o[k])));return result;
  }
  function emptyMaterial() {
    return {throughputLitres:0,eligibleLitres:0,reportedRecoveredLitres:0,grossRecoveredLitres:0,usableRecoveredLitres:0,
      topUpLitres:0,purgeLitres:0,additionalWasteLitres:0,baselineFreshLitres:0,projectFreshLitres:0,freshAvoidedLitres:0,baselineWasteLitres:0,projectWasteLitres:0,wasteAvoidedLitres:0};
  }
  function aggregateEmissions(entries) {
    const estimated=entries.filter(e=>e.status==='estimated'),missing=entries.filter(e=>e.status!=='estimated');
    const baseline=estimated.length?sum(estimated.map(e=>e.baselineKg)):null,project=estimated.length?sum(estimated.map(e=>e.projectKg)):null;
    const reduction=difference(baseline,project);
    return {status:!entries.length?'not-included':!estimated.length?'not-estimated':missing.length?'partial':'complete',
      baselineKg:baseline,projectKg:project,reductionKg:reduction,reductionTonnes:reduction===null?null:reduction/1000,
      reductionPercent:baseline!==null&&baseline>0?reduction/baseline*100:null,
      estimatedActivityCount:estimated.length,totalActivityCount:entries.length,
      missing:missing.map(e=>({id:e.id,name:e.name,reason:e.reason}))};
  }
  function serialize(scenario) {return JSON.stringify(scenario,null,2);}
  function parse(text) {
    try {const parsed=JSON.parse(text);const scenario=parsed&&parsed.modelVersion===VERSION&&parsed.scenario?parsed.scenario:parsed;const validation=calculate(scenario);return {...validation,scenario:validation.ok?scenario:null};}
    catch(e) {return {ok:false,errors:[{path:'file',code:'json',message:'The file is not valid scenario JSON.'}],warnings:[],results:null,scenario:null};}
  }
  function exportJSON(scenario) {
    const result=calculate(scenario);if(!result.ok)return {ok:false,errors:result.errors,text:null};
    return {ok:true,errors:[],text:JSON.stringify({modelVersion:VERSION,scenario:clone(scenario),...result},null,2)};
  }
  function exportCSV(scenario) {
    const result=calculate(scenario);if(!result.ok)return {ok:false,errors:result.errors,text:null};
    const rows=[['section','path','value','unit_or_context']];
    function flatten(obj,path,section) {
      if(obj===null) {rows.push([section,path,'Not estimated / not supplied','']);return;}
      if(typeof obj!=='object') {rows.push([section,path,String(obj),'']);return;}
      Object.entries(obj).forEach(([k,v])=>flatten(v,path?`${path}.${k}`:k,section));
    }
    flatten(scenario,'','input');flatten(result.results,'','result');flatten(result.warnings,'','warning');
    // Protect spreadsheet users from formula injection in entered names/notes.
    const cell=x=>{let text=String(x);if(/^[=+@\-\t\r]/.test(text)&&!/^-[0-9]+(?:\.[0-9]+)?(?:e[+-]?\d+)?$/i.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';};
    return {ok:true,errors:[],text:rows.map(row=>row.map(cell).join(',')).join('\r\n')};
  }
  return {version:VERSION,calculate,blankScenario,exampleScenario,serialize,parse,exportJSON,exportCSV};
});
