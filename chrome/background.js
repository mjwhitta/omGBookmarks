function clearBookmarks() {
  chrome.storage.local.remove("labels");
}

function createBookmark() {
  chrome.notifications.create(
    "create",
    {
      "iconUrl": "icon.png",
      "message": "Refresh bookmarks after creating a new one",
      "title": "",
      "type": "basic"
    }
  );
  chrome.tabs.query(
    {
      "active": true,
      "currentWindow": true
    },
    function (tabs) {
      var popup = "/mark?op=edit&output=popup";

      var w = window;
      var l = ((w.screenX || w.screenLeft) + 10);
      var size = "height=510px,width=550px,";
      var t = ((w.screenY || w.screenTop) + 10);
      var tl = "left=" + l + ",top=" + t + ",";

      var loc = "&bkmk=" + encodeURIComponent(tabs[0].url);
      var title = "&title=" + encodeURIComponent(tabs[0].title);

      var p = w.open(
        gbookmarks + popup + loc + title,
        "bkmk_popup",
        tl + size + "resizable=1,alwaysRaised=1"
      );

      w.setTimeout(
        function () {
          p.focus();
        },
        1000
      );
    }
  );
}

function htmlEscape(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;")
         .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
         .replace(/'/g, "&#39;");
}

function ifError() {
  if (chrome.extension.lastError) {
    console.log("Error: " + chrome.extension.lastError.message);
  }
}

function onClickListener(info, tab) {
  if (info.menuItemId == "clearMenu") {
    clearBookmarks();
  } else if (info.menuItemId == "createMenu") {
    createBookmark();
  } else if (info.menuItemId == "googleMenu") {
    chrome.tabs.create({"url": gbookmarks + "/lookup?sort=title"});
  } else if (info.menuItemId == "refreshMenu") {
    refreshBookmarks();
  }
}

function refreshBookmarks() {
  clearBookmarks();

  var req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if ((req.readyState == 4) && (req.status == 200)) {
      var data = {"labels": {}};
      var xml = req.responseXML;
      var bmarks = xml.getElementsByTagName("bookmark");

      for (var i = 0; i < bmarks.length; ++i) {
        var url = bmarks[i].getElementsByTagName(
          "url"
        )[0].childNodes[0].nodeValue;
        var title = url;
        try {
          title = bmarks[i].getElementsByTagName(
            "title"
          )[0].childNodes[0].nodeValue;
        } catch(e) {
          console.log(e);
          title = url;
        }
        var label = bmarks[i].getElementsByTagName(
          "label"
        )[0].childNodes[0].nodeValue;

        if (data["labels"][label] == null) {
          data["labels"][label] = {};
        }
        data["labels"][label][title] = url;
      }

      chrome.storage.local.set(data);
      chrome.notifications.create(
        "done",
        {
          "iconUrl": "icon.png",
          "message": "Done",
          "title": "",
          "type": "basic"
        }
      );
    } else if ((req.readyState == 4) && (req.status == 0)) {
      chrome.notifications.create(
        "empty",
        {
          "iconUrl": "icon.png",
          "message": "You need to login, then try again",
          "title": "",
          "type": "basic"
        }
      );
      chrome.tabs.create({"url": gbookmarks + "/lookup?sort=title"});
    }
  }
  req.open("GET", gbookmarks + "/?output=xml", true);
  req.send();
}

var gbookmarks = "https://www.google.com/bookmarks";

chrome.contextMenus.create(
  {
    "contexts": [
      "browser_action"
    ],
    "id": "clearMenu",
    "title": "Clear bookmarks"
  },
  ifError
);

chrome.contextMenus.create(
  {
    "contexts": [
      "browser_action"
    ],
    "id": "createMenu",
    "title": "Create bookmark"
  },
  ifError
);

chrome.contextMenus.create(
  {
    "contexts": [
      "browser_action"
    ],
    "id": "googleMenu",
    "title": "Google bookmarks"
  },
  ifError
);

chrome.contextMenus.create(
  {
    "contexts": [
      "browser_action"
    ],
    "id": "refreshMenu",
    "title": "Refresh bookmarks"
  },
  ifError
);

chrome.contextMenus.onClicked.addListener(onClickListener);

chrome.omnibox.setDefaultSuggestion(
  {"description": "Special commands: clear, create, google, refresh"}
);

chrome.omnibox.onInputChanged.addListener(
  function (input, suggest) {
    chrome.storage.local.get(
      "labels",
      function (items) {
        var suggestions = [];
        var lbls = items["labels"];
        for (var lbl in lbls) {
          bookmarks = lbls[lbl];
          for (var name in bookmarks) {
            var url = bookmarks[name];
            if (
              (input == null) ||
              (input == "") ||
              lbl.toLowerCase().match(input.toLowerCase()) ||
              name.toLowerCase().match(input.toLowerCase()) ||
              url.toLowerCase().match(input.toLowerCase())
            ) {
              suggestions.push(
                {
                  "content": url,
                  "description": "<match>" + htmlEscape(name) +
                      "</match> - <dim>" + htmlEscape(url) + "</dim>"
                }
              );
            }
          }
        }
        suggest(
          suggestions.sort(
            function (a, b) {
              var ad = a["description"].toLowerCase();
              var bd = b["description"].toLowerCase();
              var adm = ad.match(/<match>.*<\/match>/)[0];
              var bdm = bd.match(/<match>.*<\/match>/)[0];
              if (adm < bdm) {
                return -1;
              } else if (adm > bdm) {
                return 1;
              } else {
                return 0;
              }
            }
          )
        );
      }
    );
  }
);

chrome.omnibox.onInputEntered.addListener(
  function (url, disposition) {
    switch (url) {
      case "clear":
      case "rm":
        clearBookmarks();
        break;
      case "create":
      case "add":
        createBookmark();
        break;
      case "google":
      case "show":
        chrome.tabs.create(
          {"url": gbookmarks + "/lookup?sort=title"}
        );
        break;
      case "refresh":
      case "pull":
        refreshBookmarks();
        break;
      default:
        switch (disposition) {
          case "currentTab":
            chrome.tabs.update({"url": url});
            break;
          case "newBackgroundTab":
            chrome.tabs.create(
              {
                "active": false,
                "url": url
              }
            );
            break;
          case "newForegroundTab":
            chrome.tabs.create({"url": url});
            break;
        }
        break;
    }
  }
);
