
// The study establishes routing volumes, not annual net prevention or carbon savings.
window.resolveStudyModel = function () {
  const read = id => { const v=Number(document.getElementById(id).value); return Number.isFinite(v)?Math.max(0,Math.min(100,v)):0; };
  const acnPercent=read('calc-solvent-share');
  const methanolPercent=Math.min(read('calc-methanol-share'),100-acnPercent);
  const acn=acnPercent/100, methanol=methanolPercent/100;
  const factor=id=>{const text=document.getElementById(id).value.trim(),v=Number(text);return {supplied:text!==''&&Number.isFinite(v)&&v>=0,value:Number.isFinite(v)?Math.min(1000000,Math.max(0,v)):0};};
  const waterFactor={supplied:false,value:0},methanolFactor={supplied:false,value:0};
  const bufferFraction=1-acn-methanol;
  const waterProduction=bufferFraction*waterFactor.value;
  const methanolProduction=methanol*0.791*methanolFactor.value;
  const production=3.69; // Locked whole prepared mobile-phase factor, kg CO2e/L.
  const disposal=1.57,hasDisposalFactor=true; // Locked kg CO2e/L waste.
  return {acnPercent,methanolPercent,bufferPercent:100-acnPercent-methanolPercent,
    organicFraction:acn+methanol,production,waterProduction,methanolProduction,waterFactor,methanolFactor,disposal,hasDisposalFactor,carbonPerLitre:production+disposal,
    disposalShare:production+disposal?disposal/(production+disposal):0};
};
