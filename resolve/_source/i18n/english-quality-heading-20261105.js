/* English presentation only; preserve the original profile engine and wording. */
(() => {
  const heading=document.getElementById('hero-title');
  const first='Less fresh mobile phase. ';
  const second='The same analytical standards.';
  function splitQualityHeading(){
    if(heading.textContent.replace(/\s+/g,' ').trim()!==first+second ||
       heading.querySelector('br[data-quality-title-break]'))return;
    const lineBreak=document.createElement('br');
    lineBreak.setAttribute('data-quality-title-break','');
    heading.replaceChildren(document.createTextNode(first),lineBreak,document.createTextNode(second));
  }
  new MutationObserver(splitQualityHeading).observe(heading,{childList:true,subtree:true,characterData:true});
  splitQualityHeading();
})();
