<template>
  <div>
    <div class="app_main">
      <!-- Pixel helper header -->
      <div class="panelHeader">
        <div class="panelHeaderLogo">
          <img src="./images/loginLogo.svg" style="width: 70px;">
        </div>
        <div class="panelHeaderContent">
          <span style="font-size: 14px; font-weight: bold;">
            <span>RtiBid Pixel Helper</span>
          </span><br>
          <!-- <a class="hoverLink" href="https://developers.facebook.com/docs/ads-for-websites/pixel-troubleshooting">
            <span>Learn More</span>
          </a> -->
        </div>
        <!-- <div class="hoverPointer popoutButton" @click="bindPopoutWindow"><img src="./images/popout_button.jpg"></div> -->
      </div>
      <div class="pixel_info">
        <span id="overview" v-html="overviewContent"></span>
      </div>
      <!-- Pixel Details -->
      <div id="pixelDisplay">
        <div class="pixelPanel" v-for="k in strogeData" :key="k.pixelId">
          <div class="divider"></div>
          <div class="pixelBasis">
            <div class="divFormate"></div>
            <div class="pixelLogo"><img src="/images/icon128.png" style="width: 24px;"></div>
              <div class="pixelMainContainer">
                  <div class="pixelPanelOverviewTitle">
                    <span>RtiBid Pixel</span>
                  </div>
                  <p class="pixelIdDisplay">
                    <span style="cursor:pointer;">
                      <span text="1241500999285627">ID: {{ k.pixelId }}</span>&nbsp;
                      <!-- <small class="clickToCopy">click to copy</small> -->
                    </span>
                  </p>
              </div>
          </div>

          <!-- 事件内容 -->
          <div v-for="(p, pi) in k.eventList" :key="pi">
              <div>
                  <div class="hoverPointer pixelEventsAction" @click="toggleWithIconChange">
                      <p class="pixelEventDisplay">
                        <img src="./images/more_info_icon.png" class="pixelEventIconMoreInfo">
                        <img src="./images/success_icon.png" class="pixelEventIconMoreInfo">
                        <span>{{ p.eventName }}</span>
                      </p>
                  </div>
                  <div style="display: none;">
                      <div class="toggleContainer">
                          <div>
                              <div class="eventInfoTitle"><strong>Event Details</strong></div>
                              <div v-for="l in p.eventValueList">
                                <span><strong><span class="wrap-span">{{ l[0] }}</span></strong>: 
                                <span class="wrap-span">{{ l[1] }}</span></span>
                              </div>
                              <!-- <div>
                                <span>
                                  <strong><span>Pixel Location</span></strong>: 
                                  <a class="hoverLink show stringsAction"><span>Show</span></a>
                                </span>
                                <div style="display: black;">
                                  <span class="blockString">https://www.dresslily.com/</span>
                                </div>
                              </div> -->
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { 
  ref, reactive, watch, computed, unref, inject, toRaw, onMounted
} from 'vue'
import less_info_icon from "./images/less_info_icon.png";
import more_info_icon from "./images/more_info_icon.png";

const tabURL = ref("")
const strogeData = ref([]);

function displayPopup(params) {
  chrome.tabs.query({
    active: true, 
    lastFocusedWindow: true
  }, tabs => {
      // console.log(`%c chrome.tabs`, 'color:blue', tabs)
      if (!tabs.length) {
        return;
      }
      const { id, url } = tabs[0];
      let tabId = id ?? '';
      tabURL.value = url ? new URL(url).hostname : '';
  
      // open new popout
      // const tabFullURL = tabs[0]?.url ?? '';
      // if (tabFullURL.startsWith('chrome-extension')) {
      //   chrome.storage.local.get(['latestTabId'], function(storage) {
      //     tabId = storage['latestTabId'] ?? '';
      //   });
      //   chrome.storage.local.get(['latestURL'], function(storage) {
      //     tabURL.value = storage['latestURL'] ?? '';
      //   });
      // }
  
      chrome.storage.local.get(['pixelHelperDetails'], function(storage) {
        const pixelHelper = storage['pixelHelperDetails'];
        const mainContent = pixelHelper && pixelHelper[tabId] ? pixelHelper[tabId] : {};
        
        console.log(`%c displayPopup`, 'color:blue', mainContent);
  
        strogeData.value = Object.entries(mainContent).map(k => {
          const [ pixelId, eventList ] = k;
          return { pixelId, eventList }
        });
        console.log(`%c strogeData`, 'color:blue', unref(strogeData))
      });
  });
};
displayPopup()
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.pixelHelperUpdated) {
      displayPopup();
    }
  }
);

const overviewContent = computed(() => {
  let content = "";
  const len = Array.isArray(unref(strogeData)) && unref(strogeData).length ? unref(strogeData)[0].eventList.length  : 0;
  if (len == 0) {
    content = `
      No pixel detected on ${unref(tabURL)}. Please ask your developer to verify that the RtiBid Pixel code has been installed correctly.
    `
  } else {
    content = `1 pixel found on ${unref(tabURL)}`;
    // content = `${unref(tabURL)} 上发现${len}个事件`;
  }
  return content;
})

// Bind pop out action
const bindPopoutWindow = (event) => {
    event.stopPropagation();
    // close current popup
    window.close();
    // Place new pop out window on top right corner clientX
    var winObj = {
      url: "index.html",
      width: window.innerWidth,
      height: window.innerHeight + 22,
      left: event.screenX - window.innerWidth,
      top: event.screenY,
      focused: true,
      type: "popup",
      state: "normal"
    };
    // open a new window for popout
    chrome.windows.create(winObj);
}

const toggleWithIconChange = (e) => {
  // console.log(`%c toggleWithIconChange`, 'color:blue', e, e.currentTarget)
  const element = e.currentTarget;
  // console.log(`%c toggleWithIconChange`, 'color:blue', element)
  let select = element.nextElementSibling;
  let icon = element.firstElementChild.firstElementChild;
  if (select.style.display === "none") {
    select.style.display = "block";
    icon.src = less_info_icon;
  } else {
    select.style.display = "none";
    icon.src = more_info_icon;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // displayPopup();
  // chrome.runtime.sendMessage({ message: 'getParams' }, function (response) {
  //     const paramsList = document.getElementById('params-list');
  //     response.forEach(param => {
  //         const listItem = document.createElement('li');
  //         listItem.textContent = `${param.event}: ${param.domain}`;
  //         paramsList.appendChild(listItem);
  //     });
  // });
});
</script>

<style scoped>
.hoverPointer:hover {
  cursor: pointer;
}

.hoverLink:hover {
  text-decoration: underline;
  color: #5d7dae;
  cursor: pointer;
}

.hoverLink:visted {
  color: #5d7dae;
}
</style>
