/* One mount per DOM instance; supports Elementor dynamic render without global tool state. */
(() => {
  if (window.AntechTools) return;
  const factories=new Map(),mounted=new WeakSet();let serial=0;
  function mount(scope=document){
    const nodes=[...(scope.matches?.('[data-antech-tool]')?[scope]:[]),...scope.querySelectorAll('[data-antech-tool]')];
    nodes.forEach(host=>{const factory=factories.get(host.dataset.antechTool);if(!factory||mounted.has(host))return;
      let config;try{config=JSON.parse(host.dataset.antechConfig||'{}');}catch{host.textContent='Tool configuration unavailable.';return;}
      if(!host.id||document.getElementById(host.id)!==host)host.id='antech-'+host.dataset.antechTool+'-instance-'+(++serial);
      config.instance=host.id;
      host.dataset.antechMounted='true';mounted.add(host);try{factory(host,config);}catch{mounted.delete(host);host.dataset.antechMounted='';host.textContent='The tool could not initialise. Please contact Antech.';}
    });
  }
  window.AntechTools={register(kind,factory){factories.set(kind,factory);mount();},mount};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mount(),{once:true});
  // Only installed on pages where a tool shortcode enqueues this script.
  const observer=new MutationObserver(changes=>{for(const change of changes)for(const node of change.addedNodes)if(node.nodeType===1&&node.querySelectorAll)mount(node);});
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
