(() => {
  'use strict';
  if (globalThis.__humanPauseInstalled) return;
  globalThis.__humanPauseInstalled = true;
  const selector = '[data-message-author-role="assistant"], model-response';
  const tracked = new Map();
  const styles = `:host{display:block!important;position:relative!important;margin:16px 0!important;color:#263e31!important;font:14px/1.6 system-ui,sans-serif!important;clear:both!important}*{box-sizing:border-box}.gate{padding:25px;border:1px solid #d7dfca;border-radius:16px;background:#f8faf4;box-shadow:0 8px 24px #193c3410}header{display:flex;align-items:center;gap:10px;font-weight:650}.symbol{background:#e4ebd7;color:#567140;border-radius:10px;padding:2px 11px;font-size:25px}.tag{margin-left:auto;font-size:10px;color:#7e8c70}h2{font-size:24px;font-weight:600;letter-spacing:-.6px;margin:18px 0 7px}p{color:#7d8b70;font-size:13px;margin:7px 0 14px}.source{padding:13px;background:#edf2e3;border:1px solid #dfe7d1;border-radius:8px;font-size:12px;margin:16px 0}.source strong{display:block;color:#546c40}label{display:block;font-size:13px;font-weight:600}textarea{display:block;width:100%;min-height:90px;margin:10px 0 5px;border:1px solid #ccd7bf;border-radius:7px;padding:12px;font:13px/1.7 system-ui;color:#263e31;background:#fff;resize:vertical}textarea:focus{outline:2px solid #8fa675;outline-offset:2px}.hint{font-size:11px;display:block;margin-bottom:13px;color:#718260}button{padding:12px 18px;border:0;border-radius:7px;background:#31583d;color:#fff;font:600 13px system-ui;cursor:pointer}button:disabled{background:#e1e8d6;color:#9aa68d;cursor:not-allowed}button:focus-visible{outline:3px solid #8fa675;outline-offset:3px}footer{font-size:10px;color:#869577;margin-top:12px}.done{font-size:12px;padding:12px 16px;border:1px solid #dae4cd;border-radius:9px;background:#eff5e8;color:#587443}`;
  function read(node) { return node.textContent || ''; }
  function conceal(node,state) {
    // Hide the real response from layout, selection and the accessibility tree.
    node.style.setProperty('display','none','important');
    node.setAttribute('aria-hidden','true');
    node.inert=true;
  }
  function restore(node,state) {
    if(state.display)node.style.setProperty('display',state.display,state.priority);else node.style.removeProperty('display');
    if(state.aria===null)node.removeAttribute('aria-hidden');else node.setAttribute('aria-hidden',state.aria);
    node.inert=state.inert;
  }
  function gate(node,state,text,result) {
    state.locked=true;state.text=text;conceal(node,state);
    state.root.innerHTML=`<style>${styles}</style><section class="gate" aria-label="Human Pause reflection checkpoint"><header><span class="symbol" aria-hidden="true">Ⅱ</span>human pause.<span class="tag">RESEARCH PROTOTYPE</span></header><h2>Let’s pause here.</h2><p class="topic"></p><div class="source"><strong>An answer isn’t evidence.</strong>Sources have not been verified. This is a reminder to check primary evidence, not a fact-check result.</div><label for="reflection">What claim, source, or limitation would you check before relying on this answer?</label><textarea id="reflection" placeholder="I would check the original evidence to understand…" aria-describedby="hint"></textarea><span class="hint" id="hint">At least 12 words, including a specific verification step.</span><button disabled>Reflect, then reveal →</button><footer>Local keyword detection · Your reflection is not stored or sent anywhere.</footer></section>`;
    state.root.querySelector('.topic').textContent=`This response includes ${result.categories.map(c=>c.label.toLowerCase()).join(' and ')}. Make room for your own judgment.`;
    const input=state.root.querySelector('textarea'),button=state.root.querySelector('button'),hint=state.root.querySelector('.hint');
    input.addEventListener('input',()=>{const r=HumanPause.reflection(input.value);button.disabled=!r.valid;hint.textContent=r.valid?'Ready. Revealing does not verify the answer.':`${r.words} / 12 words · Name evidence, a source, a risk, or a claim to check.`;});
    button.addEventListener('click',()=>{if(!HumanPause.reflection(input.value).valid)return;const latest=read(node);if(latest!==state.text){gate(node,state,latest,HumanPause.classify(latest));return;}state.locked=false;state.accepted=latest;restore(node,state);state.root.innerHTML=`<style>${styles}</style><div class="done" role="status">✓ Human Pause complete. This answer still needs independent verification.</div>`;node.tabIndex=state.tabindex===null?-1:Number(state.tabindex);node.focus({preventScroll:true});if(state.tabindex===null)node.removeAttribute('tabindex');});
  }
  function scan(){
    for(const [node,state] of tracked){if(!node.isConnected){state.host.remove();tracked.delete(node);}}
    document.querySelectorAll(selector).forEach(node=>{
      if(node.parentElement?.closest(selector))return;
      const text=read(node);const result=HumanPause.classify(text);let state=tracked.get(node);
      if(!result.triggered){if(state){restore(node,state);state.host.remove();tracked.delete(node);}return;}
      if(!state){const host=document.createElement('human-pause-gate');state={host,root:host.attachShadow({mode:'open'}),display:node.style.getPropertyValue('display'),priority:node.style.getPropertyPriority('display'),aria:node.getAttribute('aria-hidden'),inert:node.inert,tabindex:node.getAttribute('tabindex'),locked:false};tracked.set(node,state);node.before(host);gate(node,state,text,result);return;}
      // Keep the gate attached if a client-side renderer moves or removes it.
      if(state.host.nextElementSibling!==node)node.before(state.host);
      if(state.locked){state.text=text;conceal(node,state);}else if(text!==state.accepted){gate(node,state,text,result);}
    });
  }
  let scheduled=false;
  const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;scan();},100);});
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  scan();
})();
