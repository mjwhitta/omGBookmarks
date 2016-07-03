var notifications = require("sdk/notifications");
var panel = require("sdk/panel");
var request = require("sdk/request");
var s = require("sdk/self");
var ss = require("sdk/simple-storage");
var tabs = require("sdk/tabs");
var toggle = require("sdk/ui/button/toggle");

function clearBookmarks() {
  ss.storage.labels = {};
}

function createBookmark() {
  notifications.notify(
    {"text": "Refresh bookmarks after creating a new one!"}
  );
  popup.postMessage(
    {
      "action": "createBookmark",
      "bookmarks": gbookmarks,
      "title": tabs.activeTab.title,
      "url": tabs.activeTab.url
    }
  );
}

function onShow() {
  popup.postMessage({"action": "refresh"});

  if (Object.keys(ss.storage.labels).length == 0) {
    popup.postMessage({"action": "empty"});
  } else {
    popup.postMessage(
      {
        "action": "parse",
        "lbls": ss.storage.labels
      }
    );
  }
}

function refreshBookmarks() {
  clearBookmarks();

  var req = request.Request(
    {
      "url": gbookmarks + "/?output=xml",
      "onComplete": function (response) {
        if (response.url == gbookmarks + "/?output=xml") {
          popup.postMessage(
            {
              "action": "parseXML",
              "xml": response.text
            }
          );
        } else {
          notifications.notify(
            {"text": "You need to login, then try again!"}
          );
          tabs.open(gbookmarks + "/lookup?sort=title");
        }
      }
    }
  );
  req.get();
}

function storeLabels(lbls) {
  ss.storage.labels = lbls;
}

var gbookmarks = "https://www.google.com/bookmarks";

if (!ss.storage.labels) {
  ss.storage.labels = {};
}

var button = toggle.ToggleButton(
  {
    "icon": {
      "16": "./icon.png",
      "32": "./icon.png",
      "64": "./icon.png"
    },
    "id": "omGBookmarks",
    "label": "oh-my-GoogleBookmarks",
    "onChange": function (state) {
      if (state.checked) {
        popup.show({"position": button});
      }
    }
  }
);

var popup = panel.Panel(
  {
    "contentURL": s.data.url("popup.html"),
    "contentScriptFile": s.data.url("popup.js"),
    "contentScriptWhen": "ready",
    "onHide": function () {
      button.state("window", {"checked": false});
    },
    "onMessage": function (message) {
      switch (message.action) {
        case "clearLabels":
          clearBookmarks();
          popup.hide();
          break;
        case "createBookmark":
          createBookmark();
          popup.hide();
          break;
        case "done":
          storeLabels(message.lbls);
          notifications.notify({"text": "Done!"});
          break;
        case "googleBookmarks":
          tabs.open(gbookmarks + "/lookup?sort=title");
          popup.hide();
          break;
        case "redirect":
          tabs.activeTab.url = message.url;
          popup.hide();
          break;
        case "refreshBookmarks":
          refreshBookmarks();
          popup.hide();
          break;
        case "reload":
          onShow();
          break;
      }
    },
    "onShow": onShow
  }
);
