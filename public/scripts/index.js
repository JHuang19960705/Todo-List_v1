// 獲取輸入框和按鈕元素
const inputElement = document.querySelector(".js-name-input");
const dateInputElement = document.querySelector(".js-due-date-input");
const addTodoElement = document.querySelector(".js-add-todo");
const editTodoButton = document.querySelector(".js-edit-button");
const deleteTodoButton = document.querySelector(".js-delete-button");

// 事件監聽器註冊
addTodoElement.addEventListener("click", enterAddTodoFn);
editTodoButton.addEventListener("click", editTodo);
deleteTodoButton.addEventListener("click", deleteTodo);
inputElement.addEventListener("click", hideButtonsIfClicked);
dateInputElement.addEventListener("click", hideButtonsIfClicked);
window.addEventListener("keydown", handleKeyDown);

// 輸入框和日期輸入框的輸入事件監聽器
inputElement.addEventListener("input", handleInput);
dateInputElement.addEventListener("input", handleInput);

// 從伺服器獲取待辦事項列表並渲染到頁面上
let todoList = [];
fetchDataAndRender();

// 函數定義
async function fetchDataAndRender() {
    try {
        const response = await fetch('/get_todoList');
        if (!response.ok) {
            throw new Error('無法獲取待辦事項列表');
        }
        const data = await response.json();
        todoList = data;
        renderTodoList();
    } catch (error) {
        console.error('錯誤:', error);
    }
}

// 處理輸入框的輸入事件
function handleInput() {
    const inputHasValue = inputElement.value.trim().length > 0;
    const dateHasValue = dateInputElement.value.trim().length > 0;

    // 根據輸入框和日期輸入框的值設置按鈕的狀態
    addTodoElement.style.backgroundColor = inputHasValue && dateHasValue ? "black" : "#76767676";
    addTodoElement.style.cursor = inputHasValue && dateHasValue ? "pointer" : "default";

    // 根據輸入框和日期輸入框的值設置邊框顏色
    inputElement.style.border = inputHasValue ? "1px black solid" : "1px red solid";
    dateInputElement.style.border = dateHasValue ? "1px black solid" : "1px red solid";
}

// 當按下 Enter 鍵時執行添加待辦事項函數
function handleKeyDown(e) {
    if (e.key === "Enter") {
        enterAddTodoFn();
    }
}

// 添加待辦事項函數
function enterAddTodoFn() {
    if (inputElement.value.trim() && dateInputElement.value.trim()) {
        addTodo();
    } else {
        handleInput(); // 更新按鈕和輸入框的狀態
    }
}

// 添加待辦事項到伺服器
async function addTodo() {
    const name = inputElement.value.trim();
    const due_date = dateInputElement.value.trim();

    if (!name || !due_date) {
        console.error('名稱和日期均為必填');
        return;
    }

    try {
        const response = await fetch('/add_todoList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, due_date })
        });

        if (!response.ok) {
            throw new Error('添加待辦事項失敗');
        }

        console.log(`成功添加待辦事項 名稱:${name} 日期:${due_date}`);
        inputElement.value = ""; // 清空輸入框
        dateInputElement.value = ""; // 清空日期輸入框
        await fetchDataAndRender();
    } catch (error) {
        console.error(error.message);
    }
}

// 渲染待辦事項列表
function renderTodoList() {
    const todoListHTML = todoList.map((todoObject) => {
        const { id, name, due_date } = todoObject;
        return `
            <div class="todo-wrap" data-id="${id}">
                <div class="left" data-id="${id}"><div>${name}</div></div> 
                <div class="right" data-id="${id}">
                    <div class="date">${due_date}</div>
                    <span class="more js-more" data-id="${id}">...</span>
                </div>      
            </div>
        `;
    }).join('');

    // 將待辦事項列表 HTML 插入到頁面中
    document.querySelector(".js-todo-list").innerHTML = todoListHTML;

    // 添加按鈕功能
    buttonFn();
}

// 定義點擊索引和點擊狀態變量
let clickIdex = -1;
let isClick = false;

// 顯示or隱藏編輯和刪除按鈕
function hideButtonsIfClicked() {
    if (isClick) {
        isClick = false;
        editTodoButton.style.display = "none";
        deleteTodoButton.style.display = "none";
    }
}

// 編輯待辦事項函數
function editTodo() {
    const id = editTodoButton.getAttribute("data-id"); // 獲取待辦事項的 id

    // 使用 id 直接查找相應的待辦事項
    const todoWrap = document.querySelector(`[data-id="${id}"]`);

    // 獲取待辦事項名稱和截止日期的 DOM 元素
    const todoNameDiv = todoWrap.querySelector(".left > div");
    const todoDueDateDiv = todoWrap.querySelector(".date");

    // 獲取編輯輸入框
    const existingTodoInput = todoWrap.querySelector(".left > input");
    const existingDueDateInput = todoWrap.querySelector(".right > input");

    if (existingTodoInput) {
        // 如果編輯輸入框已存在，則用戶正在編輯，提交更改
        editTodoButton.style.backgroundColor = "#76767676";
        const newName = existingTodoInput.value;
        const newDueDate = existingDueDateInput.value; // 獲取新的截止日期

        // 構建包含 ID、名稱和截止日期的物件
        const newData = { id, name: newName, due_date: newDueDate };

        // 發送 PATCH 請求
        fetch(`/update_todoList/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('更新待辦事項失敗');
                }
                console.log(`成功更新待辦事項 id:${id} 名稱:${newName} 截止日期:${newDueDate}`);
                // 在此處可以更新用戶界面或執行其他操作
            })
            .catch(error => console.error('錯誤:', error));

        // 更新待辦事項名稱和截止日期的顯示
        todoNameDiv.textContent = newName;
        todoDueDateDiv.textContent = newDueDate;

        todoNameDiv.style.display = "block";
        todoDueDateDiv.style.display = "flex";

        existingTodoInput.parentNode.removeChild(existingTodoInput);
        existingDueDateInput.parentNode.removeChild(existingDueDateInput);
    } else {
        // 如果編輯輸入框不存在，則用戶需要進入編輯模式
        editTodoButton.style.backgroundColor = "black";

        // 創建用於編輯的輸入框並將原始值填充到其中
        const newInputElement = document.createElement("input");
        newInputElement.value = todoNameDiv.textContent;

        // 創建用於編輯截止日期的輸入框並將原始值填充到其中
        const newDueDateElement = document.createElement("input");
        newDueDateElement.type = "date"; // 設置輸入框類型為日期
        newDueDateElement.value = todoDueDateDiv.textContent;

        // 隱藏原始名稱和截止日期顯示，顯示輸入框
        todoNameDiv.style.display = "none";
        todoDueDateDiv.style.display = "none";

        // 將編輯輸入框和截止日期輸入框插入到 DOM 中
        todoNameDiv.parentNode.insertBefore(newInputElement, todoNameDiv.nextSibling);
        todoDueDateDiv.parentNode.insertBefore(newDueDateElement, todoDueDateDiv.nextSibling);
    }
}

// 刪除待辦事項函數
function deleteTodo() {
    // 將字串轉換為數字類型
    let id = parseInt(deleteTodoButton.dataset.id, 10);

    fetch(`/delete_todoList/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('刪除待辦事項時出錯');
            }
            // 刪除具有特定 id 的待辦事項
            todoList = todoList.filter(todo => todo.id !== id);
            // 重新渲染待辦事項列表
            renderTodoList();
            // 隱藏編輯和刪除按鈕
            isClick = false;
            editTodoButton.style.display = "none";
            deleteTodoButton.style.display = "none";
            console.log(`成功刪除第${id}項待辦事項`);
        })
        .catch(error => console.error('錯誤:', error));
}

// 渲染待辦事項列表函數
function renderTodoList() {
    // 渲染待辦事項列表函數
    const todoListHTML = todoList.map((todoObject) => {
        const { id, name, due_date } = todoObject;
        return `
            <div class="todo-wrap" data-id="${id}">
                <div class="left" data-id="${id}"><div>${name}</div></div> 
                <div class="right" data-id="${id}">
                    <div class="date">${due_date}</div>
                    <span class="more js-more" data-id="${id}">...</span>
                </div>      
            </div>
        `;
    }).join('');

    // 將待辦事項列表 HTML 插入到頁面中
    document.querySelector(".js-todo-list").innerHTML = todoListHTML;

    // 添加按鈕功能
    buttonFn();
}

// 按鈕功能函數
function buttonFn() {
    // 按鈕功能函數
    clickIdex = -1;
    isClick = false;

    // 選擇所有的 more 按鈕並添加點擊事件監聽
    const mores = document.querySelectorAll(".js-more");
    const displayButton = function (index) {
        const toggleButtonDisplay = function (display) {
            if (display) {
                isClick = true;
                editTodoButton.style.display = "block";
                deleteTodoButton.style.display = "block";
                editTodoButton.dataset.id = index;
                deleteTodoButton.dataset.id = index;
            } else {
                isClick = false;
                editTodoButton.style.display = "none";
                deleteTodoButton.style.display = "none";
            }
        }
        if (clickIdex === index) {
            if (!isClick) {
                toggleButtonDisplay(true);
            } else {
                toggleButtonDisplay(false);
            }
        } else {
            clickIdex = index;
            toggleButtonDisplay(true);
        }
    };
    // 添加每個 more 按鈕的點擊事件
    mores.forEach((more) => {
        more.addEventListener("click", (e) => {
            displayButton(e.currentTarget.dataset.id);
        });
    });
}
