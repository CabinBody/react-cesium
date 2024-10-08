//This file is automatically rebuilt by the Cesium build process.
export default "in vec4 position;\n\
\n\
out vec3 v_outerPositionWC;\n\
\n\
#ifndef PER_FRAGMENT_ATMOSPHERE\n\
out vec3 v_mieColor;\n\
out vec3 v_rayleighColor;\n\
out float v_opacity;\n\
out float v_translucent;\n\
#endif\n\
\n\
void main(void)\n\
{\n\
    vec4 positionWC = czm_model * position;\n\
    float lightEnum = u_radiiAndDynamicAtmosphereColor.z;\n\
    vec3 lightDirection = czm_getDynamicAtmosphereLightDirection(positionWC.xyz, lightEnum);\n\
\n\
    #ifndef PER_FRAGMENT_ATMOSPHERE\n\
        computeAtmosphereScattering(\n\
            positionWC.xyz,\n\
            lightDirection,\n\
            v_rayleighColor,\n\
            v_mieColor,\n\
            v_opacity,\n\
            v_translucent\n\
        );\n\
    #endif\n\
\n\
    v_outerPositionWC = positionWC.xyz;\n\
    gl_Position = czm_modelViewProjection * position;\n\
}\n\
";
