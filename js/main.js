const boxBtn = document.getElementById('newNoteBtn');
const saveBtn = document.getElementById('saveNoteBtn');
const delAll = document.getElementById('deleteAll');
const flexBox = document.getElementById('outer-div');

const boxStorage = {
  boxes: [],
};

//= ============================================================
// Note class for creating new Note objects

class Note {
  constructor(id, title, content) {
    this.id = id;
    this.title = title;
    this.content = content;
  }
}

// =============================================================

// set multi attribute helper function
const setAttrs = (el, attrs) => {
  const attrPairs = Object.entries(attrs);
  for (let i = 0; i < attrPairs.length; i += 1) {
    el.setAttribute(attrPairs[i][0], attrPairs[i][1]);
  }
};


function createElement(el) {
  const newNote = document.createElement('div');
  const newTitle = document.createElement('div');
  const newContent = document.createElement('div');

  newTitle.innerHTML = el.title;
  newContent.innerHTML = el.content;

  setAttrs(newNote, { id: el.id, class: 'note' });
  setAttrs(newTitle, { class: 'title', contenteditable: 'true' });
  setAttrs(newContent, { class: 'container', contenteditable: 'true' });

  newNote.append(newTitle);
  newNote.append(newContent);
  flexBox.append(newNote);
}

// when new tab loads, create and display div boxes based from storage
document.body.onload = () => {
  chrome.storage.sync.getBytesInUse(null, (bytes) => {
    if (bytes) {
      chrome.storage.sync.get(null, (data) => {
        if (!chrome.runtime.error) {
          for (let i = 0; i < data.boxes.length; i += 1) {
            const el = data.boxes[i];
            // creates string from boxes array
            createElement(el);
          }
        }
      });
    }
  });
  console.log('loaded');
};

//= ================================================================

saveBtn.addEventListener('click', () => {
  // check if sync storage contains data first
  chrome.storage.sync.getBytesInUse(null, (bytes) => {
    if (bytes) {
      // get data
      chrome.storage.sync.get(null, (data) => {
        // no errors
        if (!chrome.runtime.error) {
          // combine boxStorage with data
          const outerDiv = document.getElementById('outer-div');
          boxStorage.boxes = [];
          for (let i = 0; i < outerDiv.children.length; i += 1) {
            console.log('update');
            const title = outerDiv.children[i].children[0].innerHTML;
            const content = outerDiv.children[i].children[1].innerHTML;
            const newBox = new Note(outerDiv.children[i].id, title, content);
            boxStorage.boxes.push(newBox);
          }
          data.boxes = boxStorage.boxes;
          // save updated boxes data to sync storage
          chrome.storage.sync.set(data, () => boxStorage);
        }
      });
    } else {
      // Save newly made Boxes to storage
      const outerDiv = document.getElementById('outer-div');
      for (let i = 0; i < outerDiv.children.length; i += 1) {
        // create new Box object and add to global boxes array
        console.log('new save');
        const title = outerDiv.children[i].children[0].innerHTML;
        const content = outerDiv.children[i].children[1].innerHTML;
        const newBox = new Note(outerDiv.children[i].id, title, content);
        boxStorage.boxes.push(newBox);
      }

      // save boxStorage to sync storage
      chrome.storage.sync.set(boxStorage, () =>
        // Notify that we saved.
        boxStorage);
    }
  });
});

// compounds createEl and Set Attrs functions
const createNewNoteDiv = () => {
  const newNote = document.createElement('div');
  const newContent = document.createElement('div');
  const newTitle = document.createElement('div');
  const uniqueID = Math.floor(Math.random() * 100);

  // add attributes to new elements
  setAttrs(newNote, { id: uniqueID, class: 'note' });
  setAttrs(newContent, { class: 'container', contenteditable: 'true' });
  setAttrs(newTitle, { class: 'title', contenteditable: 'true' });

  newNote.append(newTitle);
  newNote.append(newContent);
  // add new div to the dom
  flexBox.append(newNote);
};

// CREATE NEW BOX DIV
boxBtn.addEventListener('click', () => {
  createNewNoteDiv();
});

// Delete All
// =============================================================

const deleteAllDivs = () => {
  chrome.storage.sync.clear();
  const outerDiv = document.getElementById('outer-div');
  boxStorage.boxes = [];
  while (outerDiv.firstChild) {
    outerDiv.removeChild(outerDiv.firstChild);
  }
  console.log('cleared');
};

delAll.addEventListener('click', () => {
  deleteAllDivs();
});