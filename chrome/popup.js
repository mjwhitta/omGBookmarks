function backButton() {
  var button = document.createElement("button");
  button.innerHTML = "Labels";
  button.className = "hvr-icon-back";
  button.onclick = function () {
    parseLabels();
  };
  return button;
}

function bookmarkButton(name, site) {
  var button = document.createElement("button");
  button.innerHTML = htmlEscape(name);
  button.onclick = function () {
    chrome.tabs.update({"url": site});
    window.close();
  };
  return button;
}

function checkIfBookmarksStored() {
  chrome.storage.local.getBytesInUse(
    "labels",
    function (bytesInUse) {
      if (bytesInUse > 0) {
        parseLabels();
      } else {
        clearLabels();
        var labels = document.getElementById("labels");
        labels.textContent = "No bookmarks";
      }
    }
  );
}

function clearLabels() {
  var labels = document.getElementById("labels");
  while (labels.lastChild) {
    labels.removeChild(labels.lastChild);
  }
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
  var sorted = Object.keys(bookmarks).sort(
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
    var name = sorted[i];
    document.getElementById("labels").appendChild(
      bookmarkButton(name, bookmarks[name])
    );
  }
}

function parseLabels() {
  clearLabels();
  chrome.storage.local.get(
    "labels",
    function (items) {
      var lbls = items["labels"];
      var sorted = Object.keys(lbls).sort(
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
        var lbl = sorted[i];
        document.getElementById("labels").appendChild(
          labelButton(lbl, lbls[lbl])
        );
      }
    }
  );
}

window.onload = function () {
  checkIfBookmarksStored();
};
