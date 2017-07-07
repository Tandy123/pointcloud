/**
 * @author Tom
 */
		var pwgl = {};
		function calcPointTran (argument) {
				pwgl.POINTS_VERTEX_POS_BUF_NUM_ITEMS = vertexCnt;
				var minX = vertexPosition[0];
				var maxX = minX;
			    var minY = vertexPosition[1];
				var maxY = minY;
			    var minZ = vertexPosition[2];
			    var maxZ = minZ;
			    var x,y,z;	 	    
		    
           for (i=1;i<vertexCnt;i++){
		    	x = vertexPosition[i*3] ;
		    	y = vertexPosition[i*3+1] ;
		        z = vertexPosition[i*3+2] ;
		        if (x > maxX) maxX = x;		          
		        if (x < minX) minX = x;		        
		        if (y > maxY) maxY = y;		          
		        if (y < minY) minY = y;		        
		        if (z > maxZ) maxZ = z;		          
		        if (z < minZ) minZ = z;  
		    }   
 
		     
			    pwgl.MAX_X = maxX;
			    pwgl.MIN_X = minX;
			    pwgl.MAX_Y = maxY;
			    pwgl.MIN_Y = minY;
			    pwgl.MAX_Z = maxZ;
			    pwgl.MIN_Z = minZ;
		    
			    var boxScale;	
			    var boxSize;	
			    
	   
	 		    if ((pwgl.MAX_Y-pwgl.MIN_Y) > (pwgl.MAX_X-pwgl.MIN_X))
			    {
			        if ((pwgl.MAX_Y-pwgl.MIN_Y) > (pwgl.MAX_Z-pwgl.MIN_Z))
			        {
			        	boxSize =  pwgl.MAX_Y-pwgl.MIN_Y;
			            boxScale = 1.0/boxSize;
			        }
			        else
			        {
			            
			            boxSize =  pwgl.MAX_Z-pwgl.MIN_Z;
			            boxScale = 1.0/boxSize;
			        }
			    }
			    else
			    {
			        if ((pwgl.MAX_X-pwgl.MIN_X) > (pwgl.MAX_Z-pwgl.MIN_Z))
			        {
			        	boxSize =  pwgl.MAX_X-pwgl.MIN_X;
			            boxScale = 1.0/boxSize;
			        }
			        else
			        {
				        boxSize =  pwgl.MAX_Z-pwgl.MIN_Z;
			            boxScale = 1.0/boxSize;
			        }
			    }
	 			
			    pwgl.TranslateX =  pwgl.MIN_X + 0.5 * (pwgl.MAX_X-pwgl.MIN_X);
			    pwgl.TranslateY =  pwgl.MIN_Y + 0.5 * (pwgl.MAX_Y-pwgl.MIN_Y);
			    pwgl.TranslateZ =  pwgl.MIN_Z + 0.5 * (pwgl.MAX_Z-pwgl.MIN_Z);
			    pwgl.BoxScale = boxScale;
			    pwgl.BoxSize = boxSize;
 
/*			    pwgl.DistX=0;
			    pwgl.DistY=0;
			    pwgl.DistZ=2;
			    pwgl.Rotation = new THREE.Vector4();
			    pwgl.RotateDegree =0.0;
			    pwgl.RotateAxisX = 0.0;
		        pwgl.RotateAxisY = 0.0;
		        pwgl.RotateAxisZ = 1.0;
*/ 
			}	