window.onload = function () {
  const form = document.querySelector('form')
  const addButton = document.querySelector('#addButton')
  const saveEditButton = document.querySelector('#saveEditButton')
  let editIndex = null // index of the row being edited

  addButton.onclick = async function (event) {
    event.preventDefault()

    const model = document.querySelector('#model').value
    const year = document.querySelector('#year').value
    const mpg = document.querySelector('#mpg').value

    const data = { action: 'add', model, year, mpg }

    const response = await fetch('/submit', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    })

    const updatedData = await response.json()
    updateTable(updatedData)
    form.reset() 
  }

  saveEditButton.onclick = async function () {
    const model = document.querySelector('#model').value
    const year = document.querySelector('#year').value
    const mpg = document.querySelector('#mpg').value

    const data = { action: 'edit', index: editIndex, model, year, mpg }

    const response = await fetch('/submit', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    })

    const updatedData = await response.json()
    updateTable(updatedData)

    form.reset() 
    resetFormState() 
  }

  function resetFormState() {
    editIndex = null 
    addButton.style.display = 'inline' 
    saveEditButton.style.display = 'none' 
  }

  function updateTable(data) {
    const tableBody = document.querySelector('#resultsTable tbody')
    tableBody.innerHTML = ''

    data.forEach((row, index) => {
      const tr = document.createElement('tr')
      tr.innerHTML = `
        <td>${row.model}</td>
        <td>${row.year}</td>
        <td>${row.mpg}</td>
        <td>${row.age}</td>
        <td class="action">
          <button onclick="editRow(${index})" class="edit">Edit</button>
          <button onclick="deleteRow(${index})" class="delete">Delete</button>
        </td>
      `
      tableBody.appendChild(tr)
    })

    console.log("Table updated with data: ", data)
  }

  window.deleteRow = async function (index) {
    console.log('Deleting row at index:', index)

    const data = { index }

    const response = await fetch('/delete', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    })

    const updatedData = await response.json()
    updateTable(updatedData)
  }

  window.editRow = function (index) {
    console.log(`Editing row at index ${index}`)

    const row = document.querySelectorAll('#resultsTable tbody tr')[index]

    document.querySelector('#model').value = row.children[0].textContent
    document.querySelector('#year').value = row.children[1].textContent
    document.querySelector('#mpg').value = row.children[2].textContent

    editIndex = index
    console.log("Current row index set for editing: ", editIndex)

    // "Edit Mode"
    document.querySelector('#addButton').style.display = 'none'
    document.querySelector('#saveEditButton').style.display = 'inline' 
  }
}

