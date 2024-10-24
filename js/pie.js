const income = document.getElementById('myChart_income');

new Chart(income, {
  type: 'pie',
  data: {
    labels: ['Blue', 'red', 'Orange', 'Yellow', 'Green'],
    datasets: [{
      label: '# of Votes',
      data: [21, 19, 3, 5, 2],
      borderWidth: 1
    }]
  },
 
});

const expenses = document.getElementById('myChart_expenses');

new Chart(expenses, {
  type: 'pie',
  data: {
    labels: ['Blue', 'Red', 'Orange', 'Yellow', 'Green'],
    datasets: [{
      label: '# of Votes',
      data: [21, 19, 3, 5, 2],
      borderWidth: 1
    }]
  },
 
});