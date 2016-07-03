function backButton() {
  var button = document.createElement("button");
  button.innerHTML = "Labels";
  button.className = "hvr-icon-back";
  button.onclick = function () {
    self.postMessage({"action": "reload"});
  };
  return button;
}

function bookmarkButton(name, site) {
  var button = document.createElement("button");
  button.innerHTML = htmlEscape(name);
  button.onclick = function () {
    self.postMessage(
      {
        "action": "redirect",
        "url": site
      }
    );
  };
  return button;
}

function clearLabels() {
  var labels = document.getElementById("labels");
  while (labels.lastChild) {
    labels.removeChild(labels.lastChild);
  }
}

function createBookmark(bookmarks, url, name) {
  var popup = "/mark?op=edit&output=popup";

  var w = window;
  var l = ((w.screenX || w.screenLeft) + 10);
  var size = "height=510px,width=550px,";
  var t = ((w.screenY || w.screenTop) + 10);
  var tl = "left=" + l + ",top=" + t + ",";

  var loc = "&bkmk=" + encodeURIComponent(url);
  var title = "&title=" + encodeURIComponent(name);

  var p = w.open(
    bookmarks + popup + loc + title,
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

function htmlEscape(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;")
         .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
         .replace(/'/g, "&#39;");
}

function labelButton(lbl, bookmarks) {
  var button = document.createElement("button");
  button.innerHTML = htmlEscape(lbl);
  button.className = "hvr-icon-forward";
  button.onclick = function () {
    parseBookmarks(bookmarks);
  };
  return button;
}

function parseBookmarks(bookmarks) {
  clearLabels();
  document.getElementById("labels").appendChild(backButton());
  sorted = Object.keys(bookmarks).sort(
    function (a, b) {
      var l = a.toLowerCase();
      var r = b.toLowerCase();
      if (l < r) {
        return -1;
      } else if (l > r) {
        return 1;
      } else {
        return 0;
      }
    }
  );
  for (var i = 0; i < sorted.length; ++i) {
    name = sorted[i];
    document.getElementById("labels").appendChild(
      bookmarkButton(name, bookmarks[name])
    );
  }
}

function parseLabels(lbls) {
  clearLabels();
  sorted = Object.keys(lbls).sort(
    function (a, b) {
      var l = a.toLowerCase();
      var r = b.toLowerCase();
      if (l < r) {
        return -1;
      } else if (l > r) {
        return 1;
      } else {
        return 0;
      }
    }
  );
  for (var i = 0; i < sorted.length; ++i) {
    lbl = sorted[i];
    document.getElementById("labels").appendChild(
      labelButton(lbl, lbls[lbl])
    );
  }
}

function parseXML(str) {
  var data = {}
  var xml = (new window.DOMParser()).parseFromString(str, "text/xml");
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
    } catch (e) {
      console.log(e);
      title = url;
    }
    var label = bmarks[i].getElementsByTagName(
      "label"
    )[0].childNodes[0].nodeValue;

    if (data[label] == null) {
      data[label] = {};
    }
    data[label][title] = url;
  }

  self.postMessage(
    {
      "action": "done",
      "lbls": data
    }
  );
}

function showMenu() {
  clearLabels();
  document.getElementById("labels").appendChild(backButton());

  var clear = document.createElement("button");
  clear.innerHTML = "Clear bookmarks";
  clear.onclick = function () {
    self.postMessage({"action": "clearLabels"});
  };
  document.getElementById("labels").appendChild(clear);

  var create = document.createElement("button");
  create.innerHTML = "Create bookmark";
  create.onclick = function () {
    self.postMessage({"action": "createBookmark"});
  };
  document.getElementById("labels").appendChild(create);

  var google = document.createElement("button");
  google.innerHTML = "Google bookmarks";
  google.onclick = function () {
    self.postMessage({"action": "googleBookmarks"});
  };
  document.getElementById("labels").appendChild(google);

  var refresh = document.createElement("button");
  refresh.innerHTML = "Refresh bookmarks";
  refresh.onclick = function () {
    self.postMessage({"action": "refreshBookmarks"});
  };
  document.getElementById("labels").appendChild(refresh);
}

self.on(
  "message",
  function(message) {
    switch (message.action) {
      case "createBookmark":
        createBookmark(message.bookmarks, message.url, message.title);
        break;
      case "empty":
        clearLabels();
        var labels = document.getElementById("labels");
        labels.textContent = "No bookmarks";
        break;
      case "parse":
        parseLabels(message.lbls);
        break;
      case "parseXML":
        parseXML(message.xml);
        break;
      case "refresh":
        var menu = document.getElementById("menu");
        menu.onclick = showMenu;
        break;
    }
  }
);
