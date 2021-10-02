/*
Template Name: Biz Admin
Author: UXLiner
*/
(function ($) {
	"use strict";
// Use Morris.Area instead of Morris.Line

// ======
// Yearly Earning Starts
// ======

var day_data = [
  {"elapsed": "2012", "Sales": 40, "Earning": 10},
  {"elapsed": "2013", "Sales": 5, "Earning": 25},
  {"elapsed": "2014", "Sales": 50, "Earning": 35},
  {"elapsed": "2015", "Sales": 30, "Earning": 10},
  {"elapsed": "2016", "Sales": 15, "Earning": 40},
  {"elapsed": "2017", "Sales": 45, "Earning": 25},
  {"elapsed": "2018", "Sales": 60, "Earning": 15}
];
Morris.Line({
  element: 'earning',
  data: day_data,
  xkey: 'elapsed',
  ykeys: ['Sales', 'Earning'],
  labels: ['Sales', 'Earning'],
  fillOpacity: 0,
  pointStrokeColors: ['#1976d2', '#00a65a'],
  behaveLikeLine: true,
  gridLineColor: '#e0e0e0',
  lineWidth: 1,
  hideHover: 'auto',
  lineColors: ['#0077d3', '#00a65a'],
  parseTime: false,
  resize: true
});

// ======
// Yearly Earning Ending
// ======

// ======
// Donut Chart Starts
// ======

Morris.Donut({
      element: 'donut',
      data: [
        {value: 40, label: 'In-Store Sales'},
        {value: 25, label: 'Mail-Order Sales'},
        {value: 15, label: 'New Order'}
      ],
      backgroundColor: '#fff',
      labelColor: '#404e67',
      colors: [
        '#ff4558',
        '#ff7d4d',
        '#00a5a8'
      ],
      formatter: function (x) { return x + "%"}
    });

// ======
// Donut chart End
// ======

})(jQuery);