const Modal = {
  open(){
    document
      .querySelector(".modal-overlay")
      .classList
      .add("active")
  },
  close(){
    document
      .querySelector(".modal-overlay")
      .classList
      .remove("active")
  }
}

const Storage = {
  get(){
    return JSON.parse(localStorage.getItem("dev.finance:transactions"))  || []
  },
  set(transactions){
    localStorage.setItem("dev.finance:transactions", JSON.stringify(transactions))
  }
}

const Transaction = {
  all:  Storage.get(),
  add(transaction){
    Transaction.all.push(transaction)
    App.reload()
  },
  remove(index){
    Transaction.all.splice(index, 1)
    App.reload()
  },
  incomes(){
    let income = 0
    Transaction.all.forEach((transaction) => {
      if(transaction.amount > 0) income += transaction.amount
    })
    return income
  },
  expenses(){
    let expense = 0
    Transaction.all.forEach((transaction) => {
      if(transaction.amount < 0) expense += transaction.amount
    })
    return expense
  },
  total(){
    return Transaction.incomes() + Transaction.expenses()
  }
}

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),
  addTransaction(transaction, index){
    const tr = document.createElement("tr")
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index
    DOM.transactionsContainer.appendChild(tr)
  },
  innerHTMLTransaction(transaction, index){ 
    const cssClass = transaction.amount < 0 ? 'expense ': 'incoma'

    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${cssClass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onClick="Transaction.remove(${index})" src="./app/assets/minus.svg" alt="Remover Transação">
      </td>
    `
    return html
  },
  updateBalance(){
    const income = document.getElementById("incomeDisplay")
    income.innerHTML = Utils.formatCurrency(Transaction.incomes())

    const expense = document.getElementById("expenseDisplay")
    expense.innerHTML = Utils.formatCurrency(Transaction.expenses())

    const total = document.getElementById("totalDisplay")
    total.innerHTML = Utils.formatCurrency(Transaction.total())
  },
  clearTransactions(){
    DOM.transactionsContainer.innerHTML = ""
  }
}

const Utils = {
  formatCurrency(value){
    const signal = Number(value) < 0 ? '-' : ''
    value = String(value).replace(/\D/g, "")
    value = Number(value) / 100
    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
    return signal + value
  },
  formatAmount(value){
    value = Number(value)  * 100
    return value
  },
  formatDate(date){
    const splittedDate = date.split("-")

    const year = splittedDate[0]
    const month = splittedDate[1]
    const day = splittedDate[2]

    return `${day}/${month}/${year}`
  }
}

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),
  getValues(){
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },
  validateFields(){
    const { description, amount, date} = Form.getValues()
    if(
      description.trim() === "" || 
      amount.trim() === "" || 
      date.trim() === ""
    ){
      throw new Error("Por favor, preencha todos os campos!")
    }
  },
  formatValues(){
    let { description, amount, date} = Form.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return { description, amount, date } 

  },
  clearFields(){
    Form.description.value = ""
    Form.date.value = ""
    Form.amount.value = ""
  },
  submit(event){
    event.preventDefault()
    
    try {
      Form.validateFields()

      const transaction = Form.formatValues()
      
      Transaction.add(transaction)

      Form.clearFields()

      Modal.close()

    } catch (error) {
      alert(error.message)
    }
  }
}

const App = {
  start(){
    Transaction.all.forEach(DOM.addTransaction)

    DOM.updateBalance()

    Storage.set(Transaction.all)
  },
  reload(){
    DOM.clearTransactions()
    App.start()
  }
}

App.start()