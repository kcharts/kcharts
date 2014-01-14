/**
 * overview 所有图表入口
 * */
KISSY.add("gallery/kcharts/2.0/graph/index",function(S){
  var Base = S.require("base");

  var Graph = Base.extend({
    initialize:function(){
    },
    // 添加子图
    add:function(chart){
      if(chart){
        // 设置graph容器
        chart.set({
          graph:this
        });
        chart.render();
      }
    },
    // 移除子图
    remove:function(chart){
      // 销毁chart
      chart && chart.destroy(this);
    }
  });

  return Graph;
});
