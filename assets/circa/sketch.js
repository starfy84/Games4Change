psin=(x)=>1+sin(x); // positive sine
tau=2*Math.PI;
range=n=>Array.from(Array(n).keys()); //https://stackoverflow.com/questions/8273047/javascript-function-similar-to-python-range
mod=(a,b)=>((a%b)+b)%b;
player_speed=1;
initial_radius=100;
ring_spacing=50;
ring_space_usage=.8;
ringC=8;
outer_radius=initial_radius+ringC*ring_spacing-(1-ring_space_usage)*ring_spacing;
var game_start_time;
elapsed=()=>millis()-game_start_time;
Point=(x,y)=>({
	x:x,y:y,
	d:()=>
		Math.sqrt(x**2+y**2),
	add:(p)=>
		Point(x+p.x,y+p.y),
	mul:(n)=>
		Point(x*n,y*n),
});
Size=(x,y)=>Point(x,y);
Interval=(r,t)=>({r:r,t:t});
lasttime=0,currtime=0;
blend_color=(color0,color1,mix)=>
	color(
		map(mix,0,1,color0.levels[0],color1.levels[0]),
		map(mix,0,1,color0.levels[1],color1.levels[1]),
		map(mix,0,1,color0.levels[2],color1.levels[2]),
		map(mix,0,1,color0.levels[3],color1.levels[3]),
	);
var screen= ()=>{};
draw=()=>{
	this.lasttime=this.currtime;
	this.currtime=millis();
	let delta=currtime-lasttime;
	screen(delta);
}
mouseClicked=()=>0;
var score;
setup=()=>{
	document.body.style.margin=0;
	createCanvas(200,200);
	onResize=()=>
		resizeCanvas(innerWidth,innerHeight);
	onResize();
	onresize=onResize;
	frameRate(1/0);
	let player= Point();
	let white_color=color(255,255,255);
	let platform_color=color(255,200,100);
	let background_color=color(100,100,100);
	let player_color=color(151,252,27);
	let viewport=Size(innerWidth,innerHeight);
	let center=viewport.mul(1/2);
	let realMouseX,realMouseY;
	document.onmousemove=(event)=>{
		realMouseX= event.clientX;
		realMouseY= event.clientY;
	};
	let mouse=()=>Point(realMouseX,realMouseY);
	let mouse_center=()=>mouse().add(center.mul(-1));
	let playing;
	setup_game=()=>{
		playing= true;
		Platform=()=>({
			health:0
		});
		Ring=(radius)=>({
			radius:radius,
			rot:0,
			platforms:range(Math.floor(radius/platform_spacing)).map(x=>Platform()),
		});
		updatePlatforms= (delta)=>{
			for(var j=0;j<rings.length;++j) {
				radius=rings[j].radius;
				A=1;
				rings[j].rot += delta * (
					psin(radius/50 + elapsed()/200)/50/A +
					psin(radius/50 + elapsed()/500)/30/A
				) / radius;
			}
		};
		let platform_max_health=1500;
		let platform_spacing=15;
		let rings=range(ringC).map(x=>Ring(x*ring_spacing+initial_radius));
		window.mouseClicked=()=>0;
		let player=mouse();
		// raise/lower platforms
		let updateSinkFloat;
		{// set up platform floating/sinking
			platforms=rings.reduce((acc,ring)=>{
				acc.push(...ring.platforms);
				return acc;
			},[]);
			clone=(x)=>JSON.parse(JSON.stringify(x));
			live= platforms.slice();
			sunk= [];
			// removes and returns a random platform
			getPlatform=(plats)=>{
				let i= Math.floor(Math.random()*plats.length);
				let rest= plats.splice(i);
				let platform= rest[0];
				plats.push(...rest.splice(1));
				return platform;
			}
			max_allowed_sunk=()=>
				Math.min(platforms.length/5,(millis()/1000)**2/10);
			// sink some random platforms at start
			//for(let i=0,l=platforms.length/10;i<l;++i) {
			//	let platform= getPlatform(live);
			//	platform.health= platform_max_health;
			//	sunk.push(platform);
			//}
			Mover=(p,f)=>({
				platform:p,
				isFloater:f,
			});
			movers=[];
			sinkPlatform=()=>{
				if(sunk.length+1 < max_allowed_sunk()) {
					platform=getPlatform(live);
					movers.push(Mover(platform,0));
				}
				if(playing)
					setTimeout(sinkPlatform,Math.random()*1000);
			};
			sinkPlatform();
			floatPlatform=()=>{
				console.log('sunk',sunk.length);
				console.log('movers',movers);
				if(sunk.length != 0) {
					console.log('float');
					let platform=getPlatform(sunk);
					movers.push(Mover(platform,1));
				}
				if(playing)
					setTimeout(floatPlatform,Math.random()*2000);
			};
			floatPlatform();
			let move_dur= 2000;
			let max_simultaneous_movers= 10;
			updateSinkFloat=(delta)=>{
				let newMovers=[];
				for(let i=0;i<movers.length && i<max_simultaneous_movers;++i) {
					mover= movers[i];
					mover.platform.health
						+= delta/move_dur*(mover.isFloater?-1:1)
							* platform_max_health;
					if(mover.platform.health < 0) {
						mover.platform.health= 0;
						live.push(mover.platform);
					} else if(platform_max_health < mover.platform.health) {
						mover.platform.health= platform_max_health;
						sunk.push(mover.platform);
					} else
						newMovers.push(mover);
				}
				movers=newMovers;
			};
		}
		window.screen=(delta)=>{
			updatePlatforms(delta);
			updateSinkFloat(delta);
			let screen=Size(innerWidth,innerHeight);
			let center=Point(screen.x/2,screen.y/2);
			background(background_color);
			noStroke();
			let mouse_player= mouse().add(player.mul(-1));
			player= player.add(
				mouse_player.mul(1/Math.max(1,mouse_player.d()))
					.mul(delta/1000*player_speed*Math.min(100,mouse_player.d()))
			);
			let grounded=false;
			for(let j=rings.length-1;0<=j;--j) {
				let ring=rings[j];
				let radius=ring.radius;
				let rot=ring.rot;
				let platformC=ring.platforms.length;
				for(let i=0;i<platformC;++i) {
					let platform=ring.platforms[i];
					fill(blend_color(platform_color,background_color,platform.health/platform_max_health));
					let playerA=mod(Math.atan2(player.y-center.y,player.x-center.x),tau);
					let playerD=Math.sqrt(
						(player.x-center.x)**2 +
						(player.y-center.y)**2);
					let pRot= tau/platformC*i+rot;
					let pWidth= tau/platformC;
					if(
						(
							mod(pRot-pWidth/2,tau) < playerA &&
							playerA < mod(pRot+pWidth/2,tau)+(mod(pRot+pWidth/2,tau)<pWidth ? tau:0) ||
							mod(pRot-pWidth/2,tau) < playerA+tau &&
							playerA+tau < mod(pRot+pWidth/2,tau)+(mod(pRot+pWidth/2,tau)<pWidth ? tau:0)
						) &&
						radius < playerD &&
						playerD < radius+ring_spacing
					) {
						//fill(255,0,0);
						platform.health += delta;
						if(platform_max_health < platform.health)
							platform.health= platform_max_health;
						if(platform.health != platform_max_health)
							grounded=true;
					}
					let platform_thickness=ring_spacing*ring_space_usage;
					arc(center.x,center.y,
						2*(radius+platform_thickness),2*(radius+platform_thickness),
						pRot-pWidth*.4,
						pRot+pWidth*.4);
					fill(background_color);
					ellipse(center.x,center.y,
						radius*2,radius*2);
				}
			}
			fill(player_color);
			let player_radius=30
			ellipse(player.x,player.y,player_radius,player_radius);
			textAlign(CENTER);
			fill(white_color);
			textSize(50);
			text(Math.floor(elapsed()/100),center.x,center.y-20);
			textSize(60);
			text('CIRCA',center.x,center.y+40);
			if(!grounded) {
				setup_score();
			}
		};
	}
	draw_score=()=>{
		background(background_color);
		textAlign(CENTER);
		fill(white_color);
		textSize(40);
		let screen=Size(innerWidth,innerHeight);
		let center=screen.mul(1/2);
		text('You scored only '+Math.floor(score/100)+'.\nI\'m sure Andy could have done better.\nClick to play again.',center.x,center.y);
	};
	setup_score=()=>{
		playing=false;
		score= elapsed();
		window.screen=()=>0;
		window.mouseClicked=()=>{
			setup_menu();
		};
		setTimeout(()=>{
			window.screen= draw_score;
		},1000);
	}
	blend_point=(p0,p1,mix)=>
		Point(
			map(mix,0,1,p0.x,p1.x),
			map(mix,0,1,p0.y,p1.y));
	let menu_start;
	draw_menu=()=>{
		background(background_color);
		fill(platform_color);
		noStroke();
		ellipse(center.x,center.y,
			outer_radius*2);
		fill(background_color);
		ellipse(center.x,center.y,(initial_radius+ring_spacing)*2)
		textAlign(CENTER);
		fill(white_color);
		if(millis()-menu_start<3000) {
			textSize(100);
			text('CIRCA',center.x,center.y+10);
			textSize(20);
			text('Inspired by Andy Pham',center.x,center.y+40)
		} else {
			textSize(30);
			text('Strike the mouse\nwhilst it is on the ring\nto start the game.',center.x,center.y-20);
		}
	};
	setup_menu=()=>{
		menu_start=millis();
		window.screen=draw_menu;
		mouseClicked=()=>{
			console.log(mouse_center().d());
			if(initial_radius < mouse_center().d()) {
				game_start_time=millis();
				setup_game();
			}
		};
	}
	setup_menu();
}
