//创建地图函数：
function createMap() {
	var map = new BMap.Map("map_content"); //在百度地图容器中创建一个地图
	var point = new BMap.Point(118.560401, 31.682531); //定义一个中心点坐标
	map.centerAndZoom(point, 17); //设定地图的中心点和坐标并将地图显示在地图容器中
	window.map = map; //将map变量存储在全局
}

//地图事件设置函数：
function setMapEvent() {
	map.enableDragging(); //启用地图拖拽事件，默认启用(可不写)
	map.enableScrollWheelZoom(); //启用地图滚轮放大缩小
	map.enableDoubleClickZoom(); //启用鼠标双击放大，默认启用(可不写)
	map.enableKeyboard(); //启用键盘上下左右键移动地图
}

//地图控件添加函数：
function addMapControl() {
	//向地图中添加缩放控件
	var ctrl_nav = new BMap.NavigationControl({
		anchor: BMAP_ANCHOR_TOP_LEFT,
		type: BMAP_NAVIGATION_CONTROL_SMALL
	});
	map.addControl(ctrl_nav);
	
	//向地图中添加比例尺控件
	var ctrl_sca = new BMap.ScaleControl({
		anchor: BMAP_ANCHOR_BOTTOM_LEFT
	});
	map.addControl(ctrl_sca);
}

//地图函数入口
function mapHandle() {
	//创建marker
	function addMarker() {
		for(var i = 0; i < markerArr.length; i++) {
			var json = markerArr[i];
			var p0 = json.point.split("|")[0];
			var p1 = json.point.split("|")[1];
			var point = new BMap.Point(p0, p1);
			var iconImg = createIcon(json.icon);
			var marker = new BMap.Marker(point, {
				icon: iconImg
			});
			var iw = createInfoWindow(i);
			var label = new BMap.Label(json.title.split("")[0], {
				"offset": new BMap.Size(json.icon.lb - json.icon.x + 10, -20)
			});
			marker.setLabel(label);
			map.addOverlay(marker);
			label.setStyle({
				borderColor: "#808080",
				color: "#333",
				cursor: "pointer"
			});
			(function() {
				var index = i;
				var _iw = createInfoWindow(i);
				var _marker = marker;
				_marker.addEventListener("click", function() {
					this.openInfoWindow(_iw);
				});
				_iw.addEventListener("open", function() {
					_marker.getLabel().hide();
				})
				_iw.addEventListener("close", function() {
					_marker.getLabel().show();
				})
				label.addEventListener("click", function() {
					_marker.openInfoWindow(_iw);
				})
				if(!!json.isOpen) {
					label.hide();
					_marker.openInfoWindow(_iw);
				}
			})()
		}
	}
	//创建InfoWindow
	function createInfoWindow(i) {
		var json = markerArr[i];
		 var iw = new BMap.InfoWindow("<b class='iw_poi_title'>" + json.title + "</b><div class='iw_poi_content'>"+json.content+"</div>");
		return iw;
	}
	//创建一个Icon
	function createIcon(json) {
		var icon = new BMap.Icon("http://map.baidu.com/image/us_mk_icon.png", new BMap.Size(json.w, json.h), {
			imageOffset: new BMap.Size(-json.l, -json.t),
			infoWindowOffset: new BMap.Size(json.lb + 5, 1),
			offset: new BMap.Size(json.x, json.h)
		})
		return icon;
	}

	//创建和初始化地图函数：
	function initMap() {
		createMap(); //创建地图
		setMapEvent(); //设置地图事件
		//addMapControl(); //向地图添加控件
		addMarker(); //向地图中添加marker
	}
	initMap(); //创建和初始化地图
}

//
function loadMapData(){
	mui.ajax(serverip + '/GabageStateServlet', {
		data: {},
		dataType: 'json', //服务器返回json格式数据
		type: 'post', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {
			console.log(JSON.stringify(data));
		    markerArr = new Array();
			for(var i = 0; i < data.length; i++) {
				var trashBin_Overflow = '未满';
				var trashBin_Overflow_State = 0;
				if(data[i].trashBin_Overflow == 1) {
					trashBin_Overflow = '满';
					trashBin_Overflow_State = 46; //图标颜色判断
				}
				var markerPoint = { 
					title: data[i].trashBin_Num + " 号垃圾桶<span href='trash_detail.html?'id="+(i+1)+" onclick='lookDetailInfo(this.id)' style='color:#3D6DCC;font-size:6px;text-decoration:none;'> 查看详情>></span>",
					content: "状态：" + trashBin_Overflow + "<br/>温度：" + data[i].trashBin_Temperature + "<br/>湿度：" + data[i].trashBin_Humidness + "<br/>采集时间:" + data[i].trashBin_StateTime,
					point: data[i].trashBin_Point,
					isOpen: 0,
					icon: {
						w: 23,
						h: 25,
						l: trashBin_Overflow_State,
						t: 21,
						x: 9,
						lb: 12
					}
				};
				markerArr[i] = markerPoint;
			}
			mapHandle();
		},
		error: function(xhr, type, errorThrown) {

		}
	});
}