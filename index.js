const taskForm = document.getElementById("taskForm");
const titleInput = document.getElementById("title");
const descInput = document.getElementById("description");
const tagsInput = document.getElementById("tags");
const deadlineInput = document.getElementById("deadline");
const priorityInput = document.getElementById("priority");
const taskList = document.getElementById("taskList");
const tagFilter = document.getElementById("tagFilter");
const statusFilter = document.getElementById("statusFilter");


let tasks = new Map();
let uniqueTags = new Set();

window.addEventListener("DOMContentLoaded", () => {

  loadFromStorage();
  renderTask();
  updateTagFilter();
});

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const desc = descInput.value.trim();
  const tags = tagsInput.value.trim().split(",").map(tag => tag.trim()).filter(t => t);

  if (!title || !desc) {
    alert("Title and Description required!");
    return;
  }

  const id = taskForm.dataset.editingId || Date.now().toString();
  
  const task = {
    id,
    title,
    desc,
    tags,
    deadline: deadlineInput.value,
    priority: priorityInput.value,
    status:  "pending"
  };

  tasks.set(id, task);
  tags.forEach(tag => uniqueTags.add(tag));
  await saveToStorage();
  renderTask();
  updateTagFilter();
  taskForm.reset();
  delete taskForm.dataset.editingId;
});

async function saveToStorage() {
  const taskArray = Array.from(tasks.values());
  localStorage.setItem("tasks", JSON.stringify(taskArray));
}

function loadFromStorage() {
  const data = localStorage.getItem("tasks");
  if (data) {
    const taskArray = JSON.parse(data);
    taskArray.forEach(task => {
      tasks.set(task.id, task);
      task.tags.forEach(tag => uniqueTags.add(tag));
    });
  }
}

function renderTask() {
document.getElementById("alltasks").innerHTML=""
document.getElementById("pendingtasks").innerHTML=""
document.getElementById("completedtasks").innerHTML=""

  const selectedTag = tagFilter.value;
  const selectedStatus = statusFilter?statusFilter.value:""
  let completed =0;
  let pending=0;
  

 const allTasks =Array.from(tasks.values());
 const filteredTasks = allTasks.filter(task =>
    (!selectedTag || task.tags.includes(selectedTag)) &&
    (!selectedStatus || task.status === selectedStatus)
  );
  filteredTasks.forEach(task => {
    if (task.status === "completed") completed++;
    if (task.status === "pending") pending++;
  });

  if (filteredTasks.length === 0) {
    
    document.getElementById("completedCount").textContent = 0;
    document.getElementById("pendingCount").textContent = 0;
    return;
  }

  
  filteredTasks.forEach(task => {
    const li = document.createElement("li");
    li.className="task-card"
    li.draggable=true;
    li.dataset.id=task.id
    li.innerHTML = `
      <strong>${task.title}</strong><br>
      <span>${task.desc}</span><br>
      <span>Tags: #${task.tags.join(", #")}</span><br>
      <span>Deadline: ${task.deadline}</span><br>
      <span>Priority: ${task.priority}</span><br>
      <span>Status: ${task.status}</span><br>
      <button onclick="toggleStatus('${task.id}')">Toggle Status</button>
      <button onclick="editTask('${task.id}')">Edit</button>
      <button onclick="deleteTask('${task.id}')">Delete</button>
    `;
   li.addEventListener("dragstart",e=>{
    e.dataTransfer.setData("text/plain",task.id)
   })

   document.getElementById("alltasks").appendChild(li)
   if(task.status==="pending"){
    document.getElementById("pendingtasks").appendChild(li.cloneNode(true))

   }
   if(task.status==="completed"){
    document.getElementById("completedtasks").appendChild(li.cloneNode(true))
   }
      


 
  });
  document.getElementById("completedCount").textContent=completed;
  document.getElementById("pendingCount").textContent=pending;
  adddropevents()
}

function adddropevents(){
  const dropzone =document.querySelectorAll(".droppable-cards");
  dropzone.forEach(zone=>{
    zone.addEventListener("dragover",e=>{
      e.preventDefault()
      zone.classList.add("drag-over")
    })
    zone.addEventListener("dragleave",e=>{
      e.preventDefault()
      zone.classList.remove("drag-over")
    })
    zone.addEventListener("drop",async e=>{
      e.preventDefault()
      zone.classList.remove("drag-over")

      const taskId=e.dataTransfer.getData("task/plain")
      const task =tasks.get(taskId)
      if(!task){
        return
      }
      if(zone.id==="pendingtasks"){
        task.status="pending";
      }else if(zone.id==="completedtasks"){
        task.status="completed"
      }
      tasks.set(taskId,task)
      await saveToStorage()
      renderTask()
    })
    
  })
}
function editTask(id) {
  const task = tasks.get(id);
  titleInput.value = task.title;
  descInput.value = task.desc;
  tagsInput.value = task.tags.join(", ");
  deadlineInput.value = task.deadline;
  priorityInput.value = task.priority;
  taskForm.dataset.editingId = id;
}

async function deleteTask(id) {
  tasks.delete(id);
  await saveToStorage();
  renderTask();
  updateTagFilter();
}

function toggleStatus(id) {
  const task = tasks.get(id);
  task.status = task.status === "completed" ? "pending" : "completed";
  tasks.set(id, task);
  saveToStorage().then(()=>{
    renderTask()
  });
}

function updateTagFilter() {
  tagFilter.innerHTML = `<option value="">All Tags</option>`;
  uniqueTags.forEach(tag => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    tagFilter.appendChild(option);
  });
}

if (tagFilter) tagFilter.addEventListener("change", renderTask);
if (statusFilter) statusFilter.addEventListener("change", renderTask);

console.log(tasks)
console.log(localStorage.getItem("tasks"))
console.log(tagFilter);




console.log(tasks);
console.log(localStorage.getItem("tasks"));