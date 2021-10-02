/*
Template Name: Biz Admin
Author: UXLiner
*/
(function ($) {
	"use strict";

// ======
// spa bar
// ======

$("#spa-bar").sparkline([7,9,8,6,8,7,8,9,7,8], {
    type: 'bar',
    height: '70',
    barWidth: 3,
    barSpacing: 8,
    barColor: '#84bfff'});
	
// ======
// spa bar 1
// ======

$("#spa-bar-1").sparkline([7,9,8,6,8,7,8,9,7,8], {
    type: 'bar',
    height: '70',
    barWidth: 3,
    barSpacing: 8,
    barColor: '#007bff'});

// ======
// spa bar 1
// ======

$("#spa-bar-2").sparkline([15,10,15,10,9,15,10,18,14,10], {
    type: 'bar',
    height: '70',
    barWidth: 3,
    barSpacing: 8,
    barColor: '#007bff'});

// ======
// spa line
// ======

$("#spa-line").sparkline([5,6,7,9,9,8,7,8,6,8,6,7], {
    type: 'line',
    width: '120 ',
    height: '70',
    lineColor: '#ffffff',
    fillColor: '#1adcdf',
    lineWidth: 2,
	highlightSpotColor: '#00787a',
    minSpotColor: '#ff0000',
    maxSpotColor: '#ff0000',
    spotRadius: 2});

// ======
// spa line 1
// ======

$("#spa-line-1").sparkline([5,6,7,9,9,8,7,8,6,8,6,7], {
    type: 'line',
    width: '100%',
    height: '70',
    lineColor: '#ffffff',
    fillColor: '#1adcdf',
    lineWidth: 2,
	highlightSpotColor: '#00787a',
    minSpotColor: '#ff0000',
    maxSpotColor: '#ff0000',
    spotRadius: 2});

// ======
// spa line 2
// ======

$("#spa-line-2").sparkline([10,15,35,20,25,30,20,15,15,22], {
    type: 'line',
    width: '100%',
    height: '130',
    lineColor: '#ffffff',
    fillColor: '#1adcdf',
    lineWidth: 2,
	highlightSpotColor: '#00787a',
    minSpotColor: '#ff0000',
    maxSpotColor: '#ff0000',
    spotRadius: 2});
	
// ======
// spa pie
// ======

$("#spa-pie").sparkline([1,1,2], {
    type: 'pie',
    height: '70',
    sliceColors: ['#3366cc','#ef7659','#ffc56f','#109618','#66aa00','#dd4477','#0099c6','#990099 ']});

// ======
// spa pie 1
// ======

$("#spa-pie-1").sparkline([2,2,1,], {
    type: 'pie',
    height: '120',
	width: '120',
    sliceColors: ['#3366cc','#ef7659','#ffc56f','#109618','#66aa00','#dd4477','#0099c6','#990099 ']});










})(jQuery);