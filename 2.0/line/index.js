/**
 * overview line
 * 多图表合并尝试
 * TODO 简化这个大文件
 * */
;KISSY.add("gallery/kcharts/2.0/bar/index",function(S,Raphael,BaseChart,Promise,Anim,BaseUtil,D,E){
   //==================== utils start ====================

   //==================== Class Line ====================
   var Line = BaseChart.extnd({
    initializer:function(){

    },
    render:function(){
      var that = this;
      // series原始数据
      var series1 = this.get("series") || [];
      // 无数据不进行渲染
      if(series1.length === 0){
        return;
      }
      //==================== 数据格式化 ====================
      // [{name:"第一组",data:[{xval:3,y:"A"},{xval:2,yval:"B"},...]}]
      // series 标准数据格式
      var series2 = BaseUtil.formatSeriesData(series1);

      var chartBBox = this.setChartBBox();
      // 根据图表的左上角位置、图表宽度、高度（如果显示的设置了的话），转换所有的图标点为画布点

      //==================== 以上和bar一样 ====================

      var series3 = BaseUtil.convertToCanvasPoint(series2);
    }
   });


   return Line;
 },{
   requires:[
     "gallery/kcharts/2.0/raphael/index",
     "gallery/kcharts/2.0/base/index",
     "promise",
     "gallery/kcharts/1.3/animate/index",
     "../base/util",
     "dom",
     "event"
   ]
 });
