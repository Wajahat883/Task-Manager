const taskForm = document.getElementById("taskForm");
const titleInput = document.getElementById("title");
const descInput = document.getElementById("description")
const tagsInput= document.getElementById("tags")
const taskList= document.getElementById("taskList");
const tagFilter = document.getElementById("tagFilter"); 

let tasks = new Map()
let uniqueTags= new Set()

window.addEventListener("DOMContentLoaded",()=>{
    loadFromStorage();
    renderTask();
    updateTagFilter();
})

taskForm.addEventListener("submit",async(e)=>{
    e.preventDefault()
    const title=titleInput.value.trim();
    const desc=descInput.value.trim()
    const tags = tagsInput.value.trim().split(",").map(tag=>tag.trim()).filter(t=>t)
    if(![title,desc].every(Boolean)){
        alert("Title and Description required!")
        return
    }
    const id = Date.now().toString()
    const task = {id,title,desc,tags}
    tasks.set(id,task);
    tags.forEach(tag=>uniqueTags.add(tag))
    await saveToStorage();
    renderTask();
    updateTagFilter();

    taskForm.reset();


})
async function saveToStorage(){
    return new Promise((resolve)=>{
        const taskArray = Array.from(tasks.values());
        localStorage.setItem("tasks",JSON.stringify(taskArray));
        resolve("Saved!");
    })

}

function loadFromStorage(){
    const data=localStorage.getItem("tasks")
    if(data){
        const taskArray = JSON.parse(data);
        taskArray.forEach(task=>{
            tasks.set(task.id,task);
            task.tags.forEach(tag => uniqueTags.add(tag));
        })

    }
}

function renderTask(){
    taskList.innerHTML=""
    const selectedTag = tagFilter.value;
    const allTasks = Array.from(tasks.values())
    const filteredTasks = selectedTag?allTasks.filter(task=>task.tags.includes(selectedTag)):allTasks;
    filteredTasks.forEach(task=>{
        const li = document.createElement("li");
        li.innerHTML=`<div> <strong>${task.title}</strong><br>
        <span>${task.desc}</span><br>
        <span class="tags">#${task.tags.join(",#")}</span>
        </div>
        <button onclick="deleteTask('${task.id}')">del</button>`
        taskList.appendChild(li)
    })
}

async function deleteTask(id){
    tasks.delete(id);
    await saveToStorage()
    renderTask();
    updateTagFilter();
}

function updateTagFilter(){
    tagFilter.innerHTML=`<option value="">All</option>`
    uniqueTags.forEach(tag=>{
        const option=document.createElement("option");
        option.value=tag;
        option.textContent=tag;
        tagFilter.appendChild(option);
    })
}
tagFilter.addEventListener("change",renderTask)

console.log(tasks)
console.log(localStorage.getItem("tasks"))