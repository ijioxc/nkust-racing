import * as Y from 'yjs';
const doc = new Y.Doc();
const arr = doc.getArray('test');
arr.insert(0, [undefined]);
try {
  arr.toJSON();
} catch (e) {
  console.log("Error:", e.message);
}
