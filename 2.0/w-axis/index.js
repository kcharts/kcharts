/**
 * 坐标轴以及刻度，以及刻度对应的文案
 * 支持双/多坐标轴
 * TODO 1. xaxis 和 yaxis 可以选择单独进行渲染 2. 销毁实例
 *      3. 刻度尺最末尾的处理，避免重叠
 *      4. axis轴显示文案
 *      5. 添加坐标轴的时候，应该可以重新配置range
 * NOTE 1. bar的xaxis是根据实际文案来的；line/scatter的xaxis文案是根据range计算出来的
 * */
KISSY.add("gallery/kcharts/2.0/w-axis/index",function(S,Base,BaseUtil){
  //==================== Util ====================
  var each = S.each;

  /**
   * 画刻度尺
   * @param collection {Array}
   * @param opt {Object}
   *   - style {Object}
   *     - ruller 可选值为 -.-   -.    .- 三种情况
   *   - start 为0时第一个刻度要渲染
   * */
  function drawRullerPoints(collection,paper,opt){
    opt || (opt = {});
    if(arguments.length<2)
      return false;

    var style = opt.style || {};
    var joinStyle = style.ruller || "-."; // 连线样式

    var s = [];
    var p;
    var ax,bx,ay,by;
    var i=1,
        l=collection.length;
    // 特殊情况的起点为0
    if(opt.start == 0){
      i = 0;
    }
    for(;i<l;i++){
      p = collection[i];

      if(joinStyle === '-.'){
        ax = p.x0;
        ay = p.y0;
        if(opt.xaxis){
          bx = p.x2;
          by = p.y2;
        }else{
          bx = p.x1;
          by = p.y1;
        }
      }else if(joinStyle === ".-"){
        if(opt.xaxis){
          ax = p.x0;ay=p.y0;
          bx = p.x2;by=p.y2;
        }else{
          ax = p.x0;ay=p.y0;
          bx = p.x2;by=p.y2;
        }
      }else if(joinStyle === "-.-"){
        ax = p.x1;ay=p.y1;
        bx = p.x2;by=p.y2;
      }else{
        return false;
      }
      s.push("M",
             BaseUtil.roundToFixed(ax,10),
             BaseUtil.roundToFixed(ay,10),
             "L",
             BaseUtil.roundToFixed(bx,10),
             BaseUtil.roundToFixed(by,10)
            );
    }
    var ss = s.join(',');
    var path = opt.path;
    if(path){
      path.animate({path:ss},200);
    }else{
      var sstyle = BaseUtil.getDefaultLineStyle(style.style);
      path = paper.path(ss).attr(sstyle);
    }
    return path;
  }

  //==================== Class Axis ====================
  var Axis = Base.extend({
    initializer:function(){

    },
    /**
     * chart.plug()调用时渲染
     * 依赖chart实现方法：
     *   1. getBBox : 获取chart盒子
     *   2. getXYText : 获取x、y轴的文案
     * 依赖chart属性：
     *   1. xrange
     *   2. yrange
     * */
    render:function(){
      var graph = this.get("graph");
      var chart = this.get("chart");
      var paper = graph.get("paper");

      if(!chart)
        return;

      var bbox = chart.getBBox();

      // 一、普通的情况
      // note ： 当为双向的bar时，A不是在最左下角
      //   │ B
      //   │
      //   │
      //   │
      //A1 │ A                 C
      // ─└──────────
      //   │A2
      //   │
      //   │
      //   │
      //
      var Ax = bbox.left;
      var Ay = bbox.top + bbox.height;
      var A1x = Ax - 5;
      var A1y = Ay;
      var A2x = Ax;
      var A2y = Ay + 5;
      var Bx = bbox.left;
      var By = bbox.top; // TODO 如果有箭头样式要做fix
      var Cx = bbox.left + bbox.width; // TODO 如果有箭头样式要做fix
      var Cy = bbox.top + bbox.height;

      // 是否是双向的bar
      var isBiBar = (chart.chartType === "bar" && chart.get("biDirection") === true);

      // char是双向的时候，区别对待：修正AC这条线的位置
      if(isBiBar){
        Ay = bbox.top + bbox.height/2;
        Cy = Ay;
        A1y = Ay;
      }

      // x轴:x长一点
      paper.path(BaseUtil.polyLine([{x:A1x,y:A1y},{x:Cx+5,y:Cy}]));
      // y轴:y长一点
      paper.path(BaseUtil.polyLine([{x:A2x,y:A2y},{x:Bx,y:By-5}]));

      // tick标尺:x
      var xrange = chart.get("xrange");
      var rullerPointsX = BaseUtil.getRullerPoints([Ax,Ay],[Cx,Cy],{
        n:xrange.length,
        scale:5
      });
      drawRullerPoints(rullerPointsX,paper,{
        xaxis:true
      });

      // 绘制x轴标尺文案
      // each(rullerPointsX,function(p,i){
      //   paper.text(p.x0,p.y0+20,xytext.xtext[i]);
      // });

      // tick标尺:y
      var yrange = chart.get("yrange");
      var rullerPointsY;
      var start=1;
      if(isBiBar){
        // 又修正回来
        Ay = bbox.top + bbox.height;
        rullerPointsY = BaseUtil.getRullerPoints([Ax,Ay],[Bx,By],{
          n:yrange.length,
          scale:5
        });
        start = 0;
      }else{
        rullerPointsY = BaseUtil.getRullerPoints([Ax,Ay],[Bx,By],{
          n:yrange.length,
          scale:5
        });
      }
      drawRullerPoints(rullerPointsY,paper,{
        yaxis:false,
        start:start
      });

      // 绘制y轴标尺文案
      // each(rullerPointsY,function(p,i){
      //   paper.text(p.x0 - 20,p.y0,xytext.ytext[i]);
      // });

      // 获取xy轴文案
      // console.log(JSON.stringify(rullerPointsY));
      var option = {
          xunit:chart.get("@xunit"),
          yunit:chart.get("@yunit")
      };
      var xylabels = chart.getXYText(rullerPointsX, rullerPointsY, option);
      // 绘制x、y轴标尺文案
      each(xylabels.ylabel,function(p,i){
        paper.text(p.x - 15,p.y,p.ytext || i);
      });

      each(xylabels.xlabel,function(p,i){
        paper.text(p.x,p.y+15,p.xtext || i);
      });

      // 二、如果配置了双坐标轴，比如添加CD坐标轴，或者BD坐标轴
      //   │                D│D1
      // E ─────────── D2
      // B │                 │
      //   │                 │
      //   │                 │
      //   │                 │
      // A │                 │C
      // ─└──────────
      //   │                 │C1
      //
      var doubleY = this.get("doubleY");
      if(doubleY){
        var Dx = bbox.left + bbox.width;
        var Dy = bbox.top;
        var C1x = Cx;
        var C1y = bbox.top + bbox.height;
        var D1x = Dx;
        var D1y = Dy - 5;

        // y轴2:y长一点
        paper.path(BaseUtil.polyLine([{x:C1x,y:C1y},{x:D1x,y:D1y}]));

        // tick标尺:y2
        var rullerPointsY2;
        var start = 1;
        if(isBiBar){
          Cy = bbox.top + bbox.height;
          rullerPointsY2 = BaseUtil.getRullerPoints([Cx,Cy],[Dx,Dy],{
            n:yrange.length,
            scale:5
          });
          start = 0;
        }else{
          rullerPointsY2 = BaseUtil.getRullerPoints([Cx,Cy],[Dx,Dy],{
            n:yrange.length,
            scale:5
          });
        }

        drawRullerPoints(rullerPointsY2,paper,{
          yaxis:true,
          start:start,
          style:{ruller:".-"}
        });
      }

      // 双x轴
      var doubleX = this.get("doubleX");
      if(doubleX){
        var Dx = bbox.left + bbox.width;
        var Dy = bbox.top;
        var D2x = bbox.left + bbox.width + 5;
        var D2y = bbox.top;

        var Ex = bbox.left - 5;
        var Ey = bbox.top;

        // x轴2:x长一点
        paper.path(BaseUtil.polyLine([{x:Ex,y:Ey},{x:D2x,y:D2y}]));

        // tick标尺:x2
        var rullerPointsX2 = BaseUtil.getRullerPoints([Bx,By],[Dx,Dy],{
          n:xrange.length,
          scale:5
        });

        drawRullerPoints(rullerPointsX2,paper,{
          xaxis:true,
          style:{ruller:".-"}
        });
      }
    },
    destroy:function(){

    }
  });
  return Axis;
},{
  requires:[
    "base",
    "gallery/kcharts/2.0/base/util"
  ]
});