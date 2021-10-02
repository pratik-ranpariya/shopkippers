/*
Template Name: Biz Admin
Author: UXLiner
*/

// ======
// Bar chart
// ======	
var ctx = document.getElementById('bar-chart').getContext('2d');
var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'bar',

    // The data for our dataset
    data: {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [{
            label: "Active Projects",
            backgroundColor: 'rgb(0, 123, 225)',
            borderColor: 'rgb(0, 123, 225)',
            data: [5, 10, 5, 2, 20, 30, 45],
                    fill: false,
                }, {
			label: "Pending Projects",
            backgroundColor: 'rgb(4, 193, 196)',
            borderColor: 'rgb(4, 193, 196)',
            data: [8, 15, 6, 8, 10, 20, 35],
                    fill: false,
                }, {
            label: "Closed Projects",
            backgroundColor: 'rgb(220, 53, 69)',
            borderColor: 'rgb(220, 53, 69)',
            data: [10, 15, 15, 25, 45, 10, 25],
                }]
            },
	options: {
            responsive: true
        }
});

// ======
// Pie chart
// ======
new Chart(document.getElementById("pie-chart"),{
	type:'pie',
	data:{
		labels:
			['Active','Closed','Pending'],
		datasets:
			[{'label':'My First Dataset',
		data:
			[220,130,140],
		backgroundColor:
			['rgb(255, 99, 132)',
			'rgb(54, 162, 235)',
			'rgb(255, 205, 86)'],
		}]
},
	options: {
            responsive: true
        }
});