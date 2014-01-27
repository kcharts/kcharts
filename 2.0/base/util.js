;
/**
 * base utils
 * */
KISSY.add("gallery/kcharts/2.0/base/util",function(S,K){
  var BaseUtil = {};


  // for all
  // 默认连线样式
  function getDefaultLineStyle(style){
    return S.merge({"stroke":"#999","stroke-width":"1"},style);
  }
  BaseUtil.getDefaultLineStyle = getDefaultLineStyle;

  // for all svg path element
  function fixSVGLineStyle($path,svg){
    var el = svg && $path && $path[0];
    el && el.setAttribute("shape-rendering", "crispEdges");
  }
  BaseUtil.fixSVGLineStyle = fixSVGLineStyle;

  // basic tools
  // 放大m倍后，进行四舍五入
  // roundToFixed(0.006,100) ==> 0.01
  // note 直接 (num).toFixed(2) 即可!!，但是toFixe返回的是String类型
  function roundToFixed(num,m){
    return Math.round(num*m)/m;
  }
  BaseUtil.roundToFixed = roundToFixed;

  /**
   * TODO 统一所有图表的数据格式
   * 将series数据统一为标准的格式 3
   * 1. [1,3,2,8,...] for line/bar/pie
   * 2. [{xval:1,yval:"Mon",color:"red"},{xval:3,yval:"Tue"},...] for line/bar/pie
   * 3. [{name:"第一组",data:[{xval:3,y:"A"},{xval:2,yval:"B"},...]}] for line/bar
   * */
  function formatSeriesData(series){
    if(!series.length)
      return [];
    var needle = series[0];
    if(typeof needle === "number"){                 // 1.
      var data = K.map(series,function(v){
                   return {
                     yval:v
                   };
                 });
      return [{data:data}];
    }else if((typeof needle.xval !== "undefined" || // 2.
              typeof needle.yval !== "undefined")){
      return [{data:series}];
    }else{                                          // 3. 或者其它
      return series;
    }
  }
  BaseUtil.formatSeriesData = formatSeriesData;

  // 含有文案的serie转为数字化的serie
  // 将 [{xval:"星期一",yval:3},...] 转为 [{xval:2,xstring:"星期一",yval:4},...]
  // 或 [{yval:"星期一",xval:3},...] 转为 [{yval:2,ystring:"星期一",xval:4},...]
  function _textSeriesToNumberSeries(series){
    var result;
    var needle = series[0];
    var xval = series[0].xval;
    var yval = series[0].yval;
    if(!xval || typeof xval === "string"){
      result = K.map(series,function(s,index){
                 s.xstring = s.xval || index;
                 s.xval = index;
                 return s;
               });
    }
    if(!yval || typeof yval === "string"){
      result = K.map(series,function(s,index){
                 s.ystring = s.yval;
                 s.yval = index;
                 return s;
               });
    }
    result || (result = series);
    return result;
  }
  BaseUtil.textSeriesToNumberSeries = _textSeriesToNumberSeries;

  /**
   * TODO remove ： 已经没有使用这个功能函数了
   *
   * 将series数据转为画布点
   * 1. 将 [{xval:"星期一",yval:3},...] 转为 [{xval:1,xstring:"星期一",yval:4},...]
   * 2. 增加一个过滤步骤：如果配置了x和y轴的范围的话，要过滤范围之外的数据
   * 3. 将过滤后的数据再转为 [{xval:1,xstring,yval:3,x:2,y:3},...] x , y 即为实际画布上的点
   * @param series {Array}
   * @param chartBBox
   * @param xrangeConfig {Object} eg. {min:0,max:50,step:2}
   * @param yrangeConfig
   * @param filter {Function} 过滤series的函数
   * @param opt {Object}
   *   - basevalue
   *   - barPaddingX 如果是bar的化，可以是双向的
   * @param barinfo {Object}
   *   - barwidth
   *   - interval
   * @return result {Array} 格式同series，但是多了画布坐标信息x，y
   * */
  function convertSeriesToPoints(series,chartBBox,xrangeConfig,yrangeConfig,filter,opt,barinfo){
    if(!series || !series.length)
      return [];
    opt || (opt = {});
    // 1.
    var series2 = _textSeriesToNumberSeries(series);

    // 2.
    var series3;
    if(S.isFunction(filter)){
      series3 = K.filter(series2,filter);
    }else{
      series3 = series2;
    }

    var serielen = series3.length;
    // 过滤后都不剩了
    if(!serielen)
      return [];

    var xvalues = [];
    var yvalues = [];
    K.each(series3,function(serie){
      xvalues.push(serie.xval);
      yvalues.push(serie.yval);
    });

    // 获取合适的刻度
    var xrange = getRange(xvalues,xrangeConfig);
    var yrange = getRange(yvalues,yrangeConfig);

    // 如果是柱状图，可能有基线 basevalue
    var basevalue = opt.basevalue || 0;
    var barPadding = opt.barPadding;

    var xvaluerange = xrange.max - xrange.min + 1;
    var yvaluerange = yrange.max - yrange.min + 1;

    // 产生均匀的x轴刻度划分
    var xunit = (chartBBox.width - barPadding*2 + barinfo.interval) / xvaluerange;
    var yunit = (chartBBox.height) / yvaluerange;

    return K.map(series,function(i){
             var s = S.clone(i);
             s.x = s.xval*xunit;
             s.y = s.yval*yunit;
             return s;
           });
  }
  BaseUtil.convertSeriesToPoints = convertSeriesToPoints;

  // 数据值转为画布坐标值
  // @param option {Object}
  //   - m 组数目
  //   - n 每组数据条目数
  //   - xunit x单位量
  //   - yunit y单位量
  //   - isbar 是否为bar
  //   - barinfo
  //   - chartBBox 图表主体区域
  //   - barPadding 只有bar的时候才在水平方向上padding
  // @param barinfo {Object}
  //
  function convertToCanvasPoint(series,option){
    // only for bar
    var barinfo = option.barinfo;
    var barPadding = option.barPadding;

    // general
    var chartBBox = option.chartBBox;
    return K.map(series,function(serie,groupIndex){
             var xys0 = serie.data;
             // 将xys值对转为实际的画布坐标值
             var xys = K.map(xys0,function(xy,barIndex){
                         // 确定反向的标志位
                         var revert = false;
                         if(xy.yval < 0){
                           revert = true;
                         }
                         // 针对bar，有多组的算法
                         var x;
                         if(option.isbar){ // bar
                           x = groupIndex*(barinfo.barwidth + barinfo.interval) + barIndex*(option.m*barinfo.barwidth+(option.m-1)*barinfo.interval + barinfo.groupinterval);
                           x = chartBBox.left + barPadding+x;
                         }else{            // line scatter
                           x = option.xunit * xy.xval;
                           x = chartBBox.left + x;
                         }
                         var y = option.yunit*Math.abs(xy.yval);

                         var w;
                         var h;

                         // only for bar 并且是双向的柱子
                         if(option.isbar){
                           w = barinfo.barwidth;
                           var divide = 1;// 默认不是双向的柱状图，高度只分成一份
                           if(option.biDirection){
                             divide = 2;
                           }
                           if(revert){
                             h = y;
                             y = chartBBox.top + chartBBox.height/divide;
                           }else{
                             h = y;
                             y = chartBBox.top + chartBBox.height/divide - y;
                           }
                         }else{
                           y = chartBBox.top + chartBBox.height - y;
                         }
                         return {
                           x:x,      // only for bar x刻度算法
                           y:y,
                           width:w,  // only for bar
                           height:h, // only for bar
                           revert:revert
                         };
                       });
             serie.dataxy = xys;
             return serie;
           });
  }
  BaseUtil.convertToCanvasPoint = convertToCanvasPoint;

  // 获取vals范围
  // @param vals {Array}
  // @param rangeConfig {Object} eg. {min:min,max:max,step:3}
  // @return result {Object} eg. {min:min,max:max,vals:arr}
  //   arr 是计算得出的合适的递增的数组
  function getRange(vals,rangeConfig){
    var maxval = Math.max.apply(Math,vals);
    var minval = Math.min.apply(Math,vals);
    if(rangeConfig){
      if(typeof rangeConfig.min === 'number'){
        if(minval > rangeConfig.min)
          minval = rangeConfig.min;
      }
      if(typeof rangeConfig.max === 'number'){
        if(maxval > rangeConfig.max)
          maxval = rangeConfig.max;
      }
    }
    var num = vals.length; // 分成的份数
    var arr = tickIt2(minval,maxval,num);
    var len = arr.length;
    return {
      min:arr[0],
      max:arr[len-1],
      vals:arr,
      length:len
    };
  }
  BaseUtil.getRange = getRange;

  //==================== 划分刻度 ====================
  var epsilon = 2.220446049250313e-16;
  var ONE_OVER_LOG_10 = 1 / Math.log(10);

  var simplicity = function(i, n, j, lmin, lmax, lstep) {
    var v;
    v = ((lmin % lstep) < epsilon || (lstep - (lmin % lstep)) < epsilon) && lmin <= 0 && lmax >= 0 ? 1 : 0;
    return 1 - (i / (n - 1)) - j + v;
  };

  var simplicityMax = function(i, n, j) {
    return 1 - i / (n - 1) - j + 1;
  };

  var coverage = function(dmin, dmax, lmin, lmax) {
    var range;
    range = dmax - dmin;
    return 1 - 0.5 * (Math.pow(dmax - lmax, 2) + Math.pow(dmin - lmin, 2)) / (Math.pow(0.1 * range, 2));
  };

  var coverageMax = function(dmin, dmax, span) {
    var half, range;
    range = dmax - dmin;
    if (span > range) {
      half = (span - range) / 2;
      return 1 - 0.5 * (Math.pow(half, 2) + Math.pow(half, 2)) / (Math.pow(0.1 * range, 2));
    } else {
      return 1;
    }
  };

  var density = function(k, m, dmin, dmax, lmin, lmax) {
    var r, rt;
    r = (k - 1) / (lmax - lmin);
    rt = (m - 1) / (Math.max(lmax, dmax) - Math.min(dmin, lmin));
    return 2 - Math.max(r / rt, rt / r);
  };

  var densityMax = function(k, m) {
    if (k >= m) {
      return 2 - (k - 1) / (m - 1);
    } else {
      return 1;
    }
  };

  var legibility = function(lmin, lmax, lstep) {
    return 1.0;
  };
  function tickIt1(dmin, dmax, m, onlyLoose, Q, w) {
    var bestLmax, bestLmin, bestLstep, bestScore, c, cm, delta, dm, eps, g, j,
        k, l, length, lmax, lmin, max, maxStart, min, minStart, q, qi, s, score, sm,
        start, step, thisScore, z, _i, _j, _ref, _ref1;
    if (onlyLoose == null) {
      onlyLoose = false;
    }
    if (Q == null) {
      Q = [1, 5, 2, 2.5, 4, 3];
    }
    if (w == null) {
      w = {
        simplicity: 0.2,
        coverage: 0.25,
        density: 0.5,
        legibility: 0.05
      };
    }
    score = function(simplicity, coverage, density, legibility) {
      return w.simplicity * simplicity + w.coverage * coverage + w.density * density + w.legibility * legibility;
    };
    bestLmin = 0.0;
    bestLmax = 0.0;
    bestLstep = 0.0;
    bestScore = -2.0;
    eps = epsilon;
    _ref = (dmin > dmax ? [dmax, dmin] : [dmin, dmax]), min = _ref[0], max = _ref[1];
    if (dmax - dmin < eps) {
      return [min, max, m, -2];
    } else {
      length = Q.length;
      j = -1.0;
      while (j < Number.POSITIVE_INFINITY) {
        for (qi = _i = 0, _ref1 = length - 1; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; qi = 0 <= _ref1 ? ++_i : --_i) {
          q = Q[qi];
          sm = simplicityMax(qi, length, j);
          if (score(sm, 1, 1, 1) < bestScore) {
            j = Number.POSITIVE_INFINITY;
          } else {
            k = 2.0;
            while (k < Number.POSITIVE_INFINITY) {
              dm = densityMax(k, m);
              if (score(sm, 1, dm, 1) < bestScore) {
                k = Number.POSITIVE_INFINITY;
              } else {
                delta = (max - min) / (k + 1) / j / q;
                z = Math.ceil(Math.log(delta) * ONE_OVER_LOG_10);
                while (z < Number.POSITIVE_INFINITY) {
                  step = j * q * Math.pow(10, z);
                  cm = coverageMax(min, max, step * (k - 1));
                  if (score(sm, cm, dm, 1) < bestScore) {
                    z = Number.POSITIVE_INFINITY;
                  } else {
                    minStart = Math.floor(max / step) * j - (k - 1) * j;
                    maxStart = Math.ceil(min / step) * j;
                    if (minStart > maxStart) {

                    } else {
                      for (start = _j = minStart; minStart <= maxStart ? _j <= maxStart : _j >= maxStart; start = minStart <= maxStart ? ++_j : --_j) {
                        lmin = start * (step / j);
                        lmax = lmin + step * (k - 1);
                        if (!onlyLoose || (lmin <= min && lmax >= max)) {
                          s = simplicity(qi, length, j, lmin, lmax, step);
                          c = coverage(min, max, lmin, lmax);
                          g = density(k, m, min, max, lmin, lmax);
                          l = 1.0;
                          thisScore = score(s, c, g, l);
                          if (thisScore > bestScore) {
                            bestScore = thisScore;
                            bestLmin = lmin;
                            bestLmax = lmax;
                            bestLstep = step;
                          }
                        }
                      }
                    }
                    z += 1;
                  }
                }
              }
              k += 1;
            }
          }
        }
        j += 1;
      }
      return [bestLmin, bestLmax, bestLstep, bestScore];
    }
  }
  function tickIt2(min,max,n){
    var result = tickIt1(min,max,n);
    var from = result[0],
        to = result[1],
        step = result[2]

    if(to < max){
      to += step;
    }

    if(from > min){
      from -= step;
    }
    var j = (to - from)/step;
    var ret = [];
    var tmp = from;
    for(var i=1;i<=j;i++){
      ret.push(tmp);
      tmp+=step;
    }
    ret.push(tmp);
    return ret;
  }
  //==================== 划分刻度end ====================

  BaseUtil.tickIt = tickIt2;

  //==================== 连线 ====================
   /**
    * 曲线
    * @param points{Array} 点集
    * paper for test
    * */
  function polyLine(points,paper){
    var s;
    for(var i=0,l=points.length;i<l;i++){
      var point = points[i]
        , x = point.x
        , y = point.y
      // paper.circle(x,y,2);
      if(i){
        s.push("L",x,y);
      }else{
        s = ["M",x,y]
      }
    }
    return s.join(',');
  }

  /**
   * 平滑的连线，
   * 注意中间可能有断开的线段
   * @param points {Array}
   * @return str {String} Raphael path 路径字符串
   * */
  function curveLine(points){
    var str,
    arr = [],
    point, x , y;
    if(points.length <= 2){
      for(var i=0,l=points.length;i<l;i++){
        point = points[i]
        x = point.x;
        y = point.y;

        x = roundToFixed(x,100);
        y = roundToFixed(y,100);
        if(i){
          arr.push("L",x,y);
        }else{
          arr.push("M",x,y);
        }
      }
    }else{
      for(var i=0,l=points.length;i<l;i++){
        point = points[i]
        x = point.x;
        y = point.y;
        x = roundToFixed(x,100);
        y = roundToFixed(y,100);
        if(i){
          arr.push(x,y);
        }else{
          arr.push("M",x,y,'R');
        }
      }
    }
    str = arr.join(",");
    return str;
  }
  BaseUtil.polyLine = polyLine;
  BaseUtil.curveLine = curveLine;

  //==================== x/y 轴刻度生成 ====================
  // *辅助函数*
  //
  var deg2rad = Math.PI/180;
  var rad2deg = 180/Math.PI;
  // 通过a,b两点直线的夹角
  function linedeg(a,b){
    var AB = [
        b[0] - a[0],
        b[1] - a[1]
    ];

    if(AB[0] === 0){
      if(AB[1] > 0){
        return 90;
      }else if(AB[1] < 0 ){
        return -90;
      }else{
        return 0;
      }
    }else{
      var ret = rad2deg*Math.atan(AB[1]/AB[0]);
      if(AB[0] < 0){ // x 轴负方向上
        ret = ret - 180;
      }
      return ret;
    }
  }

  // *辅助函数*
  function lineon( origin, base, bias){
    if(bias > 1){
      bias = 1;
    }else if(bias < 0){
      bias = 0;
    }
    var ret = origin + (base - origin) * bias;
    return Math.round(ret*100)/100;
  };

  // *辅助函数*
  // 根据 a,b，C求出垂直的D E两点
  //           D
  //           |
  // ----a-----C------b--------------------------
  //           |
  //           E
  function verticalLine(a,b,opt){
    opt || (opt = {});
    var scale = typeof opt.scale !== 'number'?  3 : opt.scale;  // 刻度尺寸
    var ratio = typeof opt.ratio !== 'number'? .5 : opt.ratio; // c点在ab之间所占的比例，默认在中间

    var unit = 1000000;

    // 1. 求出a,b与水平的夹角
    var deg = linedeg(a,b);

    // 2. 根据夹角求出单位向量
    var ix = Math.cos(deg*deg2rad);
    var iy = Math.sin(deg*deg2rad);

    // console.log([
    //   roundToFixed(ix,unit),
    //   roundToFixed(iy,unit)
    // ]);

    // 3. 求出ab之间比例为ratio的坐标
    var x0 = lineon( a[0], b[0], ratio);
    var y0 = lineon( a[1], b[1], ratio);
    // console.log([
    //   roundToFixed(x0,unit),
    //   roundToFixed(y0,unit)
    // ]);

    // 4. 求出[x0,y0]上下点的坐标，即d、e
    var x1,x2  // 左边的点？
      , y1,y2; // 右边的点？
    x1 = x0+iy*scale; y1=y0-ix*scale;
    x2 = x0-iy*scale; y2=y0+ix*scale;

    return {
      x0:roundToFixed(x0,unit), // 保留原始值
      y0:roundToFixed(y0,unit),
      x1:roundToFixed(x1,unit),
      y1:roundToFixed(y1,unit),
      x2:roundToFixed(x2,unit),
      y2:roundToFixed(y2,unit)
    };
  }

  /**
   * util for line bar scatter
   * 获取a到b分成opt.n份的坐标集合
   * @return ret {Array} eg. [{x1,y1,x2,y2},...]
   * */
  function getRullerPoints(a,b,opt){
    var rate,ret = [],result;
    for(var i=0,n=opt.n;i<n;i++){
      rate = i/(n-1);
      opt.ratio = rate;
      result = verticalLine(a,b,opt)
      ret.push(result);
    }
    return ret;
  }
  BaseUtil.getRullerPoints = getRullerPoints;

  /**
   * util for line bar scatter
   * 绘制背景网格
   * @param bbox
   * @param lxys y轴上的ruller坐标点
   * @param bxys x轴上的rller坐标点
   * @param opt {Object}
   *   - opt.vertical {Bool} 是否为垂直
   *   - opt.paper 画布
   *   - opt.svg {Bool} 是否为svg路径
   *   - opt.axis {Number} 取值0、1、2，影响最后一个网格线的展示：0的时候网格开始结束都要展示、2的时候开始结束不展示、1的时候开始不展示
   * */
  function drawGrid(bbox,xys,opt){
    var topY = bbox.top;
    var rightX = bbox.left + bbox.width;
    var a,b;
    var x1,y1,x2,y2;
    var paper =  opt.paper;
    var pathArr = [];

    var l=xys.length;
    var i;
    var axis = opt.axis;// 默认认为展示一条轴
    if(axis === 2){
      i = 1;
      l = xys.length - 1;
    }else if(axis === 0){
      i = 0;
      l = xys.length;
    }else{
      i = 1;
      l = xys.length;
    }
    for(;i<l;i++){
      if(opt.vertical){
        x1 = xys[i].x0; y1 = xys[i].y0;
        x2 = x1;  y2 = topY;
      }else{
        x1 = xys[i].x0; y1 = xys[i].y0;
        x2 = rightX;  y2 = y1;
      }
      pathArr.push("M",x1,y1,"L",x2,y2);
    }
    var $grid = paper.path(pathArr.join(","));
    return $grid;
  }
  BaseUtil.drawGrid = drawGrid;

  return BaseUtil;
},{
  requires:[
    "gallery/kcharts/2.0/adapter/kissy"
  ]
});
