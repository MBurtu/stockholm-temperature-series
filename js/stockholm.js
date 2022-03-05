//-
//      stockholm.js
//-

//      Table of Contents
//      1. Document.ready   
//          1.1 Loading animation
//      2. Parse csv
//      3. Visualize data
//          3.1 Corrections
//          3.2 Symbol size
//          3.3 Daily observations
//          3.4 Bar chart
//      4. Attachments

//-
//-
//-

/////////////////////////////////
//
//      1. Document ready
//
/////////////////////////////////

$(document).ready(function() {
	
	////////////////////////////////////
    //      1.1 Loading animation

	loadData().catch(error => {
		console.error(error);
	});
	async function loadData() {
		// Data
		const response = await fetch("data/data.csv");
		const csv = await response.text();
		// Parse
		parseData(csv);
	}

	var years = [];
	for (var i = 1756; i <= 2018; i++) {
	   years.push(i);
	}
	var numberOfYears = years.length;
	
	function delayedIteration(index, iterableArray) {
		if (index >= iterableArray.length) {
			fade();
			return;
		}

		$("#load_years").text(iterableArray[index]);  // add one year
		// progress bar
		var percent = Math.round(((iterableArray[index]-1756)/numberOfYears)*100);
		$("#progress").css("width", percent + "%");
		$("#progress").text(percent + '%');
		
		index += 1;
		setTimeout(delayedIteration.bind({}, index, iterableArray), 15);
		
	}
	
	function fade() {
		setTimeout(function(){ 
			$('#start_bg').show(); 
			$('#loading').fadeOut("slow"); 
			}, 2000);
	}
	
	delayedIteration(0, years);

	loadClimate();
	$("#yr1756").addClass("active-bar");
	
});

/////////////////////////////////
//
//      2. Parse csv
//
/////////////////////////////////

function parseData(csv) {
	var dataObj = $.csv.toObjects(csv); 
	
	$("#year").on("click mousemove touchend touchmove", function() {

		showData(dataObj, $("#year").val(), $("#month").val(), $("#day").val());

		// Change active bar in bar chart
		$(".bar").removeClass("active-bar");
		
		var year = $("#year").val();
		var currentBar = $('#yr' + year);
		currentBar.addClass("active-bar");
		
		var anomaly = currentBar.attr("data-anomaly");
		var anomaly_abs = dot2comma(Math.abs(currentBar.attr("data-anomaly")));
		
		$(".year-anomaly").html(year);
		$(".anomaly").html(anomaly_abs);
		if (anomaly >= 0) {
			$(".cold-warm").html("<span class='dark-red'>varmare</span>");
		} else if (anomaly < 0) {
			$(".cold-warm").html("<span class='dark-blue'>kallare</span>");
		}
		
	});

	$("#month").on("click mousemove touchend touchmove", function() {
		
		showData(dataObj, $("#year").val(), $("#month").val(), $("#day").val());
		
	});

	$("#day").on("click mousemove touchend touchmove", function() {
		
		showData(dataObj, $("#year").val(), $("#month").val(), $("#day").val());
		
	});	
	
}

//////////////////////////////////////
//
//      3. Visualize data 
//
//////////////////////////////////////

////////////////////////////////////
//      3.1 Corrections

// Corrects day number if larger than days in month
function dayOfMonth (year,month,day) { 
	var daysInMonth = new Date(year, month, 0).getDate(); 
	
	if (day > daysInMonth) {
		day = daysInMonth;
	}
	
	return day;
} 

//Changes temperature, if nescessary, to correct format (ie one decimal and '' if missing) 
function corrTemp(temperature) {
	
	temperature = temperature.trim(); // removes whitespace from string
	var temp = '';
	
	if (temperature == 'NaN') {
		
		temp = '';
		
	} else if (temperature.substring(temperature.length - 2) == '00') {
		
		temp = dot2comma(temperature.substring(0, temperature.length - 1));
		
	} else if (temperature.substring(temperature.length - 2) == '.0') {
	
		temp = dot2comma(temperature);
		
	} else {	
	
		temp = dot2comma(Math.round(temperature * 10) / 10);
		
	}

	return temp;
		
}

function dot2comma(dot) {
	
	var dotStr = dot.toString();
	
	if (dotStr.includes('.')) {
		var comma = dotStr.replace('.', ',');
	} else {
		var comma = dotStr;
	}

	return comma;
}

////////////////////////////////////
//      3.2 Symbol size

// Returns size of cloud via cloudiness observation converted to eights
function cloudSize(cloudiness,year,month,day) {
	
	var inputDate = new Date(year,month-1,day);
	var date1784 = new Date(1784,5,1); // 1784-06-01
	var date1815 = new Date(1815,11,31); // 1815-12-31
	var date1841 = new Date(1841,5,30); // 1841-06-31
	var date1858 = new Date(1858,11,31); // 1858-12-31
	var date1872 = new Date(1872,11,31); // 1872-12-31
	var date1960 = new Date(1960,11,31); // 1960-12-31
	var date2012 = new Date(2012,11,31); // 2012-12-31
	
	var eights = 0; var range = []; var cloudSun = [];
	
	if (inputDate <= date1784) {
		
		range = [0,4,8];
		
		eights = range[cloudiness-1];

	} else if (inputDate > date1784 && inputDate <= date1815) {
		
		range = [0,2,3,4,6,8];
		
		eights = range[cloudiness-1];
		
	} else if (inputDate > date1815 && inputDate <= date1841) {
		
		range = [0,4,6,8];
		
		eights = range[cloudiness-1];
		
	} else if (inputDate > date1841 && inputDate <= date1858) {
		
		range = [0,2,4,5,7,8];
		
		eights = range[cloudiness-1];
		
	} else if (inputDate > date1858 && inputDate <= date1872) {
		
		range = [0,2,4,6,8];
		
		eights = range[cloudiness];
		
	} else if (inputDate > date1872 && inputDate <= date1960) {
		
		range = [0,1,2,3,4,4,5,6,7,8,8];
		
		eights = range[cloudiness];
		
	} else if (inputDate > date1960 && inputDate <= date2012) {
		
		range = [0,1,2,3,4,5,6,7,8,8];
		
		eights = range[cloudiness];
		
	} else if (inputDate > date2012) {
		
		range = [0,1,2,3,4,4,5,6,7,8,8];
		
		eights = range[Math.round(cloudiness/10)];
		
	}
	
	if (eights === 0){
		
		cloudSun = ['0em','0em','-0.5em','1em','-0.5em'];  // [cloud size, cloud pos left, cloud pos top, sun size, sun pos top]
		
	} else if (eights == 1 || eights == 2) {
		
		cloudSun = ['0.4em','1em','-1.3em','1em','-0.5em'];
		
	} else if (eights == 3 || eights == 4) {
		
		cloudSun = ['0.6em','0.6em','-0.9em','1em','-0.5em'];
		
	} else if (eights >= 5 && eights <= 7) {
		
		cloudSun = ['0.8em','0.2em','-0.7em','1em','-0.5em'];
	
	} else if (eights == 8) {
		
		cloudSun = ['1em','0vw','-0.5em','0em','-0.5em'];
	
	}

	return cloudSun;
	
}

////////////////////////////////////
//      3.3 Daily observations

function showData (dataObj, year, month, day) {
	
	var dayCor = dayOfMonth(year,month,day);
	
	var chosenDate = dataObj.filter(function (el) {
		return el.year == year &&
		el.month == month &&
		el.day == dayCor;
	});

	var todayDate = new Date(year, month - 1, day);
	var tomorrowDate = new Date(todayDate.getTime() + (24 * 60 * 60 * 1000));

	const months = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
 	const monthsNr = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

	$("#input_year").text(year);
	$("#input_month").text(months[month-1]);
	$("#input_day").text(dayCor);
	
	// Temperature
	var morning_temp = corrTemp(chosenDate[0].morning_temp);
	var noon_temp = corrTemp(chosenDate[0].noon_temp);
	var evening_temp = corrTemp(chosenDate[0].evening_temp);
	
	$("#temp_morning").html(morning_temp + '&deg;C');
	$("#temp_noon").html(noon_temp + '&deg;C');
	if (chosenDate[0].evening_temp !== 'NaN') {
		$("#temp_evening").html(evening_temp + '&deg;C');
	} else {
		$("#temp_evening").html('');
	}
	
	if (chosenDate[0].tmax !== 'NaN') {	
		$("#temp_max").html(corrTemp(chosenDate[0].tmax) + '&deg;C');
	} else {
		$("#temp_max").html('');
	}
	
	if (chosenDate[0].tmin !== 'NaN') {	
		$("#temp_min").html(corrTemp(chosenDate[0].tmin) + '&deg;C');
	} else {
		$("#temp_min").html('');
	}
	
	// Cloudiness
	var morning_cld = cloudSize(chosenDate[0].morning_cld,year,month,dayCor);
	var noon_cld = cloudSize(chosenDate[0].noon_cld,year,month,dayCor);
	var evening_cld = cloudSize(chosenDate[0].evening_cld,year,month,dayCor);
	
	if (morning_cld.length == 0) {
		$("#cld_morning").html('<span class="red"></span>');
	} else {
		$("#cld_morning").html('<span class="sun" style="font-size:'+morning_cld[3]+';top:'+morning_cld[4]+';"><i class="fas fa-sun"></i></span><span class="cloud" style="font-size:'+morning_cld[0]+';left:'+morning_cld[1]+';top:'+morning_cld[2]+';"><i class="fas fa-cloud"></i></span>');
	}
	if (noon_cld.length == 0) {
		$("#cld_noon").html('<span class="red"></span>');
	} else {
		$("#cld_noon").html('<span class="sun" style="font-size:'+noon_cld[3]+';top:'+noon_cld[4]+';"><i class="fas fa-sun"></i></span><span class="cloud" style="font-size:'+noon_cld[0]+';left:'+noon_cld[1]+';top:'+noon_cld[2]+';"><i class="fas fa-cloud"></i></span>');
	}
	if (evening_cld.length == 0) {
		$("#cld_evening").html('<span class="red"></span>');
	} else {
		$("#cld_evening").html('<span class="sun" style="font-size:'+evening_cld[3]+';top:'+evening_cld[4]+';"><i class="fas fa-sun"></i></span><span class="cloud" style="font-size:'+evening_cld[0]+';left:'+evening_cld[1]+';top:'+evening_cld[2]+';"><i class="fas fa-cloud"></i></span>');
	}

	// Snow depth
	var snowDepth = chosenDate[0].snow_depth;
	if (snowDepth == 'NaN') { 
		$('.depth_cm').html('');
		$('.depth_time').html('');
	} else {
		var snowDepth_cm = Math.round(snowDepth * 100 * 10) / 10; // m -> cm
		$('.depth_cm').html(snowDepth_cm + ' <span class="unit">cm</span>');
		let today = dayCor + '/' + monthsNr[month-1];
		$('.depth_time').html(today + ' 06Z<br><br>');
	}
	
	// 24hr precipitation
	var precip24 = chosenDate[0].precip24;
	if (precip24 == 'NaN') { 
		$('.precip24').html('');
		$('.precip_time').html('');
	} else {
		$('.precip24').html(dot2comma(precip24) + ' <span class="unit">mm</span>');
		let today = dayCor + '/' + monthsNr[month-1];
		let tomorrow = tomorrowDate.getDate() + '/' + monthsNr[tomorrowDate.getMonth()]; 
		$('.precip_time').html(today + ' 06Z &#10145;' + tomorrow + ' 06Z<br>');
	}	
	
} 


////////////////////////////////////
//      3.4 Bar chart

function loadClimate() {

	var w = $("#climate").width();
	var h = $("#climate").height();

	// set the dimensions and margins of the graph
	var margin = {top: 10, right: 0, bottom: 20, left: 20},
	width = w - margin.left - margin.right,
	height = h - margin.top - margin.bottom;

	// Ticks
	const yTicks = [-3,-2,-1,0,1,2,3];
	const xTicks = d3.range(1760,2020,10);

	// Axis
	var y = d3.scaleLinear()
		.domain([Math.min(...yTicks), Math.max(...yTicks)])
		.range([height, 0]);
   
	var x = d3.scaleBand()
		.rangeRound([0, width]);

	// SVG	
	var svg = d3.select("#climate").append("svg")
	   .attr("width", width + margin.left + margin.right)
	   .attr("height", height + margin.top + margin.bottom)
	   .append("g")
	   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const barSpacing = 1; //px
   
	d3.json("data/annual_mean.json").then(function(data){
		x.domain(data.map(function(d) {
			return d.year;
		}));

		// Grid
		// Y
		svg.selectAll("yline")
		.data(yTicks)
		.enter().append("line")
			.attr("x1", 0)
			.attr("x2", width)
			.attr("y1", function(d) { 
				svg.append("text")
					.attr("class", "ticks")
					.attr("text-anchor", "middle")
					.attr("x", 0)
					.attr("y", y(d) + emToPx(0.6)/2 - 1) 
					.text(d);

				return y(d); 		
			})
			.attr("y2", function(d) { return y(d); })
			.attr("class", "gridline");

		// X
		svg.selectAll("xline")
			.data(xTicks)
			.enter().append("line")
				.attr("x1", function(d) {
					svg.append("text")
						.attr("class", "ticks")
						.attr("text-anchor", "middle")
						.attr("x", x(d))
						.attr("y", height + emToPx(0.6)) 
						.text(d);

					return x(d); 			
				})
				.attr("x2", function(d) { return x(d); })
				.attr("y1", 0)
				.attr("y2", height)
				.attr("class", "gridline");
   
		// Bars
		svg.selectAll(".bar")
			.data(data)
			.enter().append("rect")
			.attr("class", function(d) {
				if (d.anomaly < 0){
					return "bar negative-bar";
				} else {
					return "bar positive-bar";
				}
			})
			.attr("y", function(d) {
				if (d.anomaly > 0){
					return y(d.anomaly);
				} else {
					return y(0);
				}
			})
			.attr("id", function(d) { return "yr" + d.year; })
			.attr("data-anomaly", function(d) { return d.anomaly; })
			.attr("x", function(d) {
				return x(d.year) + barSpacing/2;
			})
			.attr("width", x.bandwidth() - barSpacing)
			.attr("height", function(d) {
				return Math.abs(y(d.anomaly) - y(0));
			});
   
	   	// Line
		var runningMean = d3.line()
		   .curve(d3.curveNatural)
		   .x(function(d) { return x(d.year); })
		   .y(function(d) { return y(d.running_anomaly_10); });

		var runningData = [];
		for (var i = 0; i < data.length; i++) {
			if (data[i].running_anomaly_10 != null) {
				runningData.push(data[i]);
			}
		}

		svg.selectAll(".running_means")
			.data([runningData])
			.enter().append("path")
			.attr("class", "running_mean")
			.attr("d", runningMean);

		// Title 
		svg.append("text")
			.attr("class", "title")
			.attr("text-anchor", "middle")
			.attr("x", width/2)
			.attr("y", margin.top) 
			.html("&aring;rsmedelv&auml;rde & 10 &aring;rs glidande medelv&auml;rde relativt 1756-2018 [&deg;C]");
		
	});

}

//////////////////////////////////////
//
//      4. Attachments
//
//////////////////////////////////////

function showExtra(extra) {

	var dataID = $(extra).attr('data-id');
	
	$('#wrapper').hide();
	$('#' + dataID).css('display', 'flex');

	$('.extra_btn').hide();

}

function closeExtra() {

	$('.extra').hide();
	$('#wrapper').show();
	$('.extra_btn').show();

}

function showAttachment(attachment){
	
	$(attachment).parent().animate({right: "0%"}, 1000);
	
}	
function hideAttachment(attachment){
	
	$(attachment).parent().parent().animate({right: "-45%"}, 1000);
	
}

function emToPx(em) {

    var el = document.getElementById("slider_container");
    var style = window.getComputedStyle(el, null).getPropertyValue("font-size");
    var fontSize = parseFloat(style); 
    var px = em*fontSize;

    return px;

}