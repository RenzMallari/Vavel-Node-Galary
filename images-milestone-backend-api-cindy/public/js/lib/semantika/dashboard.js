'use strict';
function users_chart() {
    if ($('#users-chart').length > 0) {
        var data = []

        function initiateData() {
            for (var i = 9; i >= 0; i --) {
                data.push({
                    x: `-${i+1} secs`,
                    y: 0
                });
            }
        }

        initiateData();

        function pushData(viewtimes) {
            for (var i = 0; i < data.length; i++) {
                if (i+1 < data.length) {
                    data[i].y=data[i+1].y
                } else {
                    data[i].y = viewtimes;
                }
            }
        }

        var options = {
            chart: {
                height: 270,
                type: 'line',
                animations: {
                    enabled: false,
                    easing: 'linear',
                    dynamicAnimation: {
                        speed: 1000
                    }
                },
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth'
            },
            series: [{
                data: data
            }],
            markers: {
                size: 0
            },
            yaxis: {
                max: 100
            },
            legend: {
                show: false
            },
        }

        var chart = new ApexCharts(
            document.querySelector("#users-chart"),
            options
        );

        chart.render();
        window.setInterval(function () {
            var element = document.getElementsByClassName("ActiveUsers-value");
            if (element[0]) {
                let count = element[0].innerHTML?element[0].innerHTML:0;
                pushData(count);
            }
            chart.updateSeries([{
                data: data
            }])
        }, 1000)
    }
}
