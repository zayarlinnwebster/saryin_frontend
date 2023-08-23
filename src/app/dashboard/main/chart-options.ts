export const itemChartOptions = {
  chart: {
    type: 'bar',
    fontFamily: 'MON3, sans-serif',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150,
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350,
      },
    },
  },
  plotOptions: {
    bar: {
      horizontal: true,
    },
  },
  noData: {
    text: 'အချက်အလက်မရှိပါ။',
    align: 'center',
    verticalAlign: 'middle',
    offsetX: 0,
    offsetY: 0,
  },
};

export const vendorPaymentChartOptions = {
  chart: {
    type: 'bar',
    fontFamily: 'MON3, sans-serif',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150,
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350,
      },
    },
  },
  plotOptions: {
    bar: {
      horizontal: true,
    }
  },
  noData: {
    text: 'အချက်အလက်မရှိပါ။',
    align: 'center',
    verticalAlign: 'middle',
    offsetX: 0,
    offsetY: 0,
  },
};

export const customerPaymentChartOptions = {
  chart: {
    type: 'bar',
    fontFamily: 'MON3, sans-serif',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150,
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350,
      },
    },
  },
  plotOptions: {
    bar: {
      horizontal: true,
    }
  },
  noData: {
    text: 'အချက်အလက်မရှိပါ။',
    align: 'center',
    verticalAlign: 'middle',
    offsetX: 0,
    offsetY: 0,
  },
};

export const totalChartOptions = {
  chart: {
    type: 'pie',
    height: '300',
    fontFamily: 'MON3, sans-serif',
    toolbar: {
      show: true,
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150,
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350,
      },
    },
  },
  noData: {
    text: 'အချက်အလက်မရှိပါ။',
    align: 'center',
    verticalAlign: 'middle',
    offsetX: 0,
    offsetY: 0,
  },
};

export const amountChartOptions = {
  chart: {
    type: 'line',
    height: '300',
    fontFamily: 'MON3, sans-serif',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150,
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350,
      },
    },
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: true,
        zoom: false,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: false,
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: 3,
    curve: 'straight',
    dashArray: [0, 0],
  },
  legend: {
    tooltipHoverFormatter: function (val: string, opts: any) {
      return (
        val +
        ' - <strong>' +
        opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
        '</strong>'
      );
    },
  },
  markers: {
    size: 0,
    hover: {
      sizeOffset: 6,
    },
  },
  tooltip: {
    y: [
      {
        title: {
          formatter: function (val: string) {
            return val;
          },
        },
      },
      {
        title: {
          formatter: function (val: string) {
            return val;
          },
        },
      },
      {
        title: {
          formatter: function (val: string) {
            return val;
          },
        },
      },
    ],
  },
  grid: {
    borderColor: '#f1f1f1',
  },
  noData: {
    text: 'အချက်အလက်မရှိပါ။',
    align: 'center',
    verticalAlign: 'middle',
    offsetX: 0,
    offsetY: 0,
  },
};
