
function initialize_3d() {
	
	jQuery("#3dView").click(function(e) {
	//	e.preventDefault();
//		jQuery(this).tab('show');
		/*jQuery("#3dView").parent().addClass("active");
		jQuery("#plan").parent().removeClass("active");
		jQuery("#elevation").parent().removeClass("active");
		jQuery("#map-canvas").toggleClass("hidden");
	*/	var canvas3d = jQuery("#canvas3d");
		//canvas3d.toggleClass("hidden");
		create_3d_view();
		//onWindowResize();
		//window.g3d.renderer.render();
		//canvas3d.renderer.setSize( canvas3d.innerWidth(), canvas3d.innerHeight() );
	});
}

function create_3d_view() {
	var container = jQuery("#canvas3d");
	if(container.children().length >0) {
		return;
	}
	
	var innerWidth = jQuery("#3dview").parent().innerWidth();
	var innerHeight =  jQuery("#3dview").parent().innerHeight();
	var aspect = innerWidth/innerHeight;
	scene = new THREE.Scene();
	//camera = new THREE.PerspectiveCamera( 45, innerWidth / innerHeight, 1, 10000 );
	camera = new THREE.OrthographicCamera(-1000/aspect, 1000/aspect, 200, -1000, -10000, 10000);
	controls = new THREE.OrbitControls( camera );
	controls.damping = 0.2;
	controls.addEventListener( 'change', render );
		
	//var renderer = new THREE.CanvasRenderer();
	 var renderer = new THREE.WebGLRenderer( { antialias: true } );
	 
	renderer.setClearColor( 0x000000 );
	
	renderer.setSize( innerWidth, innerHeight );
			
	//var container = jQuery("#canvas3d");
	container.append(renderer.domElement);
	
	var group = new THREE.Object3D();
	
	jQuery.ajaxSetup({
        async: false
	});
	jQuery.getJSON( "/static/garden.json", 
		function( json ) {
			var material = new THREE.LineBasicMaterial({
				color: 0xffffff,
				linewidth: 2,
			});
			var pMaterial = new THREE.PointCloudMaterial({
					color: 0xff0000,
					size: 3,
				//sizeAttenuation : false,
				fog:false
			});
			var stationGeometry = new THREE.Geometry();
			var lineStrips = json.strips;
			for(var s=0; s<lineStrips.length; s++) {
				var strip = lineStrips[s];
				var geometry = new THREE.Geometry();
				for(var p=0; p<strip.length; p++)
				{
					var point = strip[p];
					var v = new THREE.Vector3(point[0],point[1],point[2]);
					geometry.vertices.push(v);
					stationGeometry.vertices.push(v);
				}
				var line = new THREE.Line( geometry, material );
				group.add(line);
			}
			stationGeometry.computeBoundingSphere();
			stationGeometry.computeBoundingBox();
			var stations = new  THREE.PointCloud(stationGeometry, pMaterial);
			var center = stationGeometry.boundingSphere.center;
	
//			camera = new THREE.OrthographicCamera(stationGeometry.boundingBox);
			camera.position.set(center.x+1000, center.y, center.z);
			camera.up.set( 0, 0, 1 );
			camera.lookAt(center);
			group.add(stations);
			//group.position.set(center.x,center.y,center.z);
		}
	);
	jQuery.ajaxSetup({
        async: true
	});
	

	scene.add(group);
	//group.computeBoundingSphere();
	
	//var geometry = new THREE.BoxGeometry(1,1,1);
	//var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	//var cube = new THREE.Mesh( geometry, material );
	//scene.add( cube ); 
	//camera.position.x += 2000;
	//camera.up.set( 0, 0, 1 );
	//camera.lookAt(group);
	var currentTime = Date.now();
	/*function render() 
	{
		requestAnimationFrame(render);
		renderer.render(scene, camera);
		
		var now = Date.now();
		var deltat = now - currentTime;
		currentTime = now;
		
		group.rotation.z += 0.02 * deltat/25;
	} */
	
	window.addEventListener( 'resize', onWindowResize, false );

	controls.addEventListener('change', render);
	animate();
	//jQuery("#3d-canvas").appendChild( renderer.domElement );
	
	function onWindowResize() {
			var innerWidth = jQuery("#3dview").parent().innerWidth();
			var innerHeight =  jQuery("#3dview").parent().innerHeight();		
			var aspect = innerWidth/innerHeight;
			camera.aspect = aspect;
			camera.updateProjectionMatrix();
			renderer.setSize( innerWidth, innerHeight );
			render();
	}

	function render() {
		renderer.render( scene, camera );
	}
			
	function animate() {
		requestAnimationFrame(animate);
		controls.update();
	}
}

jQuery(document).ready(function(){
	initialize_3d();
});