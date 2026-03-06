// processed data
chrome.runtime.onInstalled.addListener(() => {
    console.log('扩展已安装');
});

// Stored raw data for dedupe
// Stored tr endpoints requests URL

// Stored combined data for above
// structure is pixelHelperDetails -> [tabId] -> [pixel id] -> [pixel event]
var pixelHelperDetails = {};
// Temporarily stored urls. tabid : url
var currentURL = {};
// Latest tab id
var latestTabId = null;

// 删除标签数据
function removeDataForTab(tabId) {
  if (tabId in pixelHelperDetails) {
    delete pixelHelperDetails[tabId];
    chrome.storage.local.set({ 'pixelHelperDetails': pixelHelperDetails });
  }
  if (latestTabId == tabId) {
    latestTabId = null;
  }
}
// 在标签页关闭时触发。
chrome.tabs.onRemoved.addListener(
  (tabId, removeInfo) => {
    console.log(`%c onRemoved`, 'color:blue', tabId, removeInfo)
    removeDataForTab(tabId);
  }
);

// 当窗口中的活动标签页发生变化时触发; 切换到当前tab
chrome.tabs.onActivated.addListener(function(activeInfo) {
    console.log(`%c onActivated`, 'color:blue', activeInfo)
    // Save last tab id to local storage for popout purpose
    chrome.storage.local.set({ 'latestTabId': latestTabId ?? '' });
    chrome.storage.local.set({ 'latestURL': currentURL[latestTabId]?? '' });

    latestTabId = activeInfo.tabId;
    chrome.runtime.sendMessage({pixelHelperUpdated: "updated"}, function (response) {
      if (chrome.runtime.lastError) {
        // Ignore error when popup not trigered.
        // Message as `Receiving end does not exist`
    }});
});

// 清理存储以便重新加载和导航
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId === 0)  { // only care about outer frame
        console.log(`%c onBeforeNavigate`, 'color:blue', details)
        removeDataForTab(details.tabId);
        currentURL[details.tabId] = details.url;
        latestTabId = details.tabId;
    }
});

// 如果使用 History API 修改帧的状态（例如，使用 history.pushState()， 触发 onHistoryStateUpdated 事件
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    console.log(`%c onHistoryStateUpdated`, 'color:blue', details)
    if (details.frameId === 0 && currentURL[details.tabId])  {
        const oldURL = new URL(currentURL[details.tabId]);
        const newURL = new URL(details.url);
        if (oldURL && newURL && (oldURL.host !== newURL.host || oldURL.pathname !== newURL.pathname)) {
            removeDataForTab(details.tabId);
            currentURL[details.tabId] = details.url; // update new url
            latestTabId = details.tabId;
        }
    }
});

/**
 * @description: 设置图标
 * @param {*}
 */
function setIcon(tabId, pixelCount) {
  // let iconPath = {};
  // if(pixelCount > 0) {
  //   iconPath = {
  //     '19': './images/pixel_helper_icon_19.png',
  //     '38': './images/pixel_helper_icon_38.png',
  //   };
  // } else {
  //   iconPath = {
  //     '19': './images/pixel_helper_icon_faded_19.png',
  //     '38': './images/pixel_helper_icon_faded_38.png',
  //   };
  // }
  // chrome.action.setIcon({
  //     tabId: tabId,
  //     path: iconPath,
  // });
  chrome.action.setBadgeText({
      tabId: tabId,
      text: pixelCount > 0 ? String(pixelCount) : '',
  });
  chrome.action.setBadgeBackgroundColor({
    tabId: tabId,
    color: '#6BB933',
  });
}

/**
 * @description: 拦截请求；从 Web 请求中检索数据，必要时进行重复数据删除
 * @param {*}
 */
function beforeTRRequest(request) {
    // console.log(`%c beforeTRRequest`, 'color:blue', request.tabId)
    const url = new URL(request.url);
    const urlParams = new URLSearchParams(url.search);
    const tabId = request.tabId;
    const pixelId = urlParams.get("id");
    const event = urlParams.get("en");
    // Drop duplicate requests causing by pixel helper mv2
    //   if (urlParams.get("dt")) {
    //     return;
    //   }

    if (!pixelHelperDetails[tabId]) {
      pixelHelperDetails[tabId] = {};
    }
    if (!pixelHelperDetails[tabId][pixelId]) {
      pixelHelperDetails[tabId][pixelId] = [];
    }

    const deleteKeys = ["id", "en", "kid" ,"oid", "d"];

    const eventValueList = []
    for (const [key, value] of urlParams.entries()) {
      if (!deleteKeys.includes(key)) {
        const value_new = value ? decodeURIComponent(value) : value;
        // console.log(`%c key`, 'color:blue', value_new)
        eventValueList.push([key, value_new]);
      }
    }
    pixelHelperDetails[tabId][pixelId].push({
      eventName: event,
      eventValueList
    });

    const tabTotalEventsCount = pixelHelperDetails[tabId][pixelId].length;
    setIcon(Number(tabId), tabTotalEventsCount);
    // console.log(`%c updateDetails`, 'color:blue', pixelHelperDetails)
    chrome.storage.local.set({ 'pixelHelperDetails': pixelHelperDetails });

    chrome.runtime.sendMessage({pixelHelperUpdated: "updated"}, function (response) {
      if (chrome.runtime.lastError) {
        // Ignore error when popup not trigered.
        // Message as `Receiving end does not exist`
      }
    });
}

// 拦截请求
chrome.webRequest.onBeforeRequest.addListener(
  beforeTRRequest,
  {urls: ["*://*.vantacdn.com/collect*"]},
  ['extraHeaders', 'requestBody']
);

chrome.webRequest.onErrorOccurred.addListener(
  function() {
    console.log("Error occured in request interception");
  },
  {urls: ["*://*.vantacdn.com/collect*"]}
);
