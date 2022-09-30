
// running on shaderTOY

const float boneLen = .15;

mat2  _rot1(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c,s,-s,c);
}

float mExp( vec2 p1, vec2 p2, in vec2 uv ){
    return ( uv.y - p2.y ) * ( p1.x - p2.x ) -( ( uv.x - p2.x ) * ( p1.y - p2.y ) );
}

float drawLine( vec2 p1, vec2 p2, in vec2 uv ){
    float p = mExp( p1, p2, uv );
    
    p = smoothstep( .0, p, length( p1 - p2 ) / max( iResolution.x, iResolution.y ) );
    
    float lt, rt, lb, rb;
    
    if( p1.x - p2.x != 0. ){
        lt = min( p1.x, p2.x );
        rt = max( p1.x, p2.x );
        p *= step( lt, uv.x );
        p *= step( uv.x, rt );
    }
    
    if( p1.y - p2.y != 0. ){
        lb = min( p1.y, p2.y );
        rb = max( p1.y, p2.y );
        p *= step( lb, uv.y );
        p *= step( uv.y, rb );
    }

    
    return p;
}

vec2 quadBezier( float t, vec2 p1, vec2 p2, vec2 c1 ){
    return pow( 1. - t, 2. ) * p1 + 2. * t * ( 1. - t ) * c1 + t * t * p2;
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    
    // dr. u no why mod?
    uv = mod( uv, .5 );
    
    // Time varying pixel color
    vec3 col = vec3( 0. );
    
    float p = 0.;

    vec2 p1 = vec2( .2, .1 ),
         p2 = vec2( .7, .8 ),
         c1 = vec2( .3 + cos( iTime ) * .3, .5 + sin( iTime ) * .5 );
    
    
    for( float i = 0.; i < 30.; i++ ){
        float ii = i / 30.;
        
        vec2 bone = quadBezier( ii, p1, p2, c1 );
        
        float s = atan( c1.y + 1., c1.x );
        
        p += step( length( bone - vec2( uv.x, uv.y )  ), .01 ) * .7;
        
        float bl = boneLen / 2.;
        float bp1 = bl / s;
        float bp2 = sqrt( bl * bl - bp1 * bp1 );
        
        float dir = s > 3.14 * .5 ? 1. : -1.;
        bp1 *= dir;
        bp2 *= dir;
        
        p += drawLine( vec2( bone.x + bp1, bone.y - bp2 ), vec2( bone.x - bp1, bone.y + bp2 ), uv );
    }
    
    col += p;

    // Output to screen
    fragColor = vec4(col,1.0);
}
