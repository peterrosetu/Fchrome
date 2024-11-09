window.onload = function() {
    var nav = document.getElementById('nav');
    var oNav = nav.getElementsByTagName('button');
    var container = document.getElementById('container');
    var oDiv = container.getElementsByClassName('tab');
    for (var i = 0; i < oNav.length; i++) {
        oNav[i].index = i;
        oNav[i].onclick = function() {
            for (var i = 0; i < oNav.length; i++) {
                oNav[i].className = '';
                oDiv[i].style.display = "none";
            }
            this.className = 'act';
            oDiv[this.index].style.display = "block"
        }
        for (var m = 1; m < oNav.length; m++) {
            oNav[m].className = '';
            oDiv[m].style.display = "none";
        }
    }
}

function _mk_html(input, clsname, index){
  var div = document.getElementById(clsname)
  div.innerHTML += `
  <label ><input class="${clsname}-e0" type="checkbox" id="${clsname}" data-key="config-hook-all-${clsname}" vilame="${index}">${clsname} 全选/全不选<br /> </label>
  `
  var htmls = []
  var keys = []
  for (var i = 0; i < input.length; i++) {
    var kv = input[i]
    var k = kv[0]
    var v = kv[1]
    if (keys.indexOf(k) == -1){
      keys.push(k)
      htmls.push(`<label style="margin-left: 20px" >${k}<br /> </label>`)
    }
    htmls.push(`<label style="margin-left: 40px; display:block" ><input class="${clsname}-e2" checked=true type="checkbox" data-key="config-hook-${k}-${v}" vilame="${index}">${k} ${v}<br /></label> `)
  }
  div.innerHTML += htmls.join('')
}

_mk_html(getsets_0, 'getsets_0', 0)
_mk_html(funcs_0, 'funcs_0', 0)
_mk_html(getsets_1, 'getsets_1', 1)
_mk_html(funcs_1, 'funcs_1', 1)



var get_now = document.getElementById('get_now');
get_now.addEventListener("click", function(){
  var show_now = document.getElementById('show_now')
  show_now.value = +new Date+''
  chrome.storage.local.set({
    [show_now.dataset.key]: show_now.value
  })
})


function sub_logger(){
  chrome.storage.local.get([
    'config-proxy-hook',
    ], function(e){
    chrome.browserAction.setBadgeBackgroundColor({color: '#BC1717'});
    var info = ''
    if (e['config-proxy-hook']){
      info += 'P'
    }
    if (e['config-function-proxy-hook']){
      info += 'F'
    }
    if (e['config-iframe-proxy-hook']){
      info += 'I'
    }
    chrome.browserAction.setBadgeText({text: info});
  })
}

document.querySelectorAll("input").forEach(function(v){
  chrome.storage.local.get([v.dataset.key], function (result) {
    if (v.type == 'checkbox'){
      v.checked = result[v.dataset.key];
    }
    if (v.type == 'text'){
      v.value = result[v.dataset.key] || '';
    }
  })
  v.addEventListener("change", function (e) {
    if (v.type == 'checkbox'){
      console.log(e.target.dataset.key, e.target.checked)
      chrome.storage.local.set({
        [e.target.dataset.key]: e.target.checked
      })
      sub_logger()
    }
    if (v.type == 'text' || v.type == 'password'){
      chrome.storage.local.set({
        [e.target.dataset.key]: e.target.value
      })
    }
  })
})

function changer(name, index, v){
  if (v.target.dataset.key.indexOf('config-hook-all-') === -1){
    chrome.storage.local.set({
      [v.target.dataset.key]: v.target.checked
    })
    return
  }
  var ck = v.target.checked
  var wt = {}
  document.querySelectorAll("input").forEach(function(v){
    if (v.className.indexOf(name) !== -1){
      if (+v.getAttribute('vilame') == index){
        v.checked = ck
        wt[v.dataset.key] = v.checked
      }
    }
  })
  chrome.storage.local.set(wt)
}


document.getElementById('getsets_0').addEventListener("change", changer.bind(null, 'getsets_0', 0))
document.getElementById('funcs_0').addEventListener("change", changer.bind(null, 'funcs_0', 0))
document.getElementById('getsets_1').addEventListener("change", changer.bind(null, 'getsets_1', 1))
document.getElementById('funcs_1').addEventListener("change", changer.bind(null, 'funcs_1', 1))

var proxy_all = document.getElementById('proxy_all');
proxy_all.addEventListener("click", function(){
  var selec=document.getElementsByName('proxy-obj');
  for(var i=0; i<selec.length; i++){
      if(selec[i].type=='checkbox'){
        selec[i].checked=!selec[i].checked;
        chrome.storage.local.set({
          [selec[i].getAttribute("data-key")]: selec[i].checked
        })
      }
       

  }
})