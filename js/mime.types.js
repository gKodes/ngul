var mimetypes = {};
mimetypes['audio'] = '.adp .au .snd .mid .midi .kar .rmi .mp4a .mpga .mp2 .mp2a .mp3 .m2a .m3a .oga .ogg .spx .s3m .sil .uva .uvva .eol .dra .dts .dtshd .lvp .pya .ecelp4800 .ecelp7470 .ecelp9600 .rip .weba .aac .aif .aiff .aifc .caf .flac .mka .m3u .wax .wma .ram .ra .rmp .wav .xm';
mimetypes['image'] = '.bmp .cgm .g3 .gif .ief .jpeg .jpg .jpe .ktx .png .btif .sgi .svg .svgz .tiff .tif .psd .uvi .uvvi .uvg .uvvg .sub .djvu .djv .dwg .dxf .fbs .fpx .fst .mmr .rlc .mdi .wdp .npx .wbmp .xif .webp .3ds .ras .cmx .fh .fhc .fh4 .fh5 .fh7 .ico .sid .pcx .pic .pct .pnm .pbm .pgm .ppm .rgb .tga .xbm .xpm .xwd';
mimetypes['video'] = '.3gp .3g2 .h261 .h263 .h264 .jpgv .jpm .jpgm .mj2 .mjp2 .mp4 .mp4v .mpg4 .mpeg .mpg .mpe .m1v .m2v .ogv .qt .mov .uvh .uvvh .uvm .uvvm .uvp .uvvp .uvs .uvvs .uvv .uvvv .dvb .fvt .mxu .m4u .pyv .uvu .uvvu .viv .webm .f4v .fli .flv .m4v .mkv .mk3d .mks .mng .asf .asx .vob .wm .wmv .wmx .wvx .avi .movie .smv';

function typeOfExt(type) {
  return function isTypeOf(ext) {
    return (ext[0] === '.' && mimetypes[type].indexOf(ext) !== -1);
  };
}

var isAudioByExt = typeOfExt('audio');
var isImageByExt = typeOfExt('image');
var isVideoByExt = typeOfExt('video');
