import svgPaths from "./svg-bfnch18tyz";
import imgAvatarByewind from "figma:asset/5d1e58c8086fe7ad86b64a6151f47a2a2aa8357a.png";
import imgAvatarAbstract03 from "figma:asset/a6291df320bba44005babfd6bca1bab752b24ac1.png";
import imgAvatarFemale03 from "figma:asset/82dab5f59562fb682b36a8ccaa46b847a00123c7.png";
import imgAvatarMale02 from "figma:asset/ff23b0883aad53dd3045b7033a7f72108d9cf839.png";
import imgAvatar3D03 from "figma:asset/efb4c5c371433b7befe07a6b8161dddcd8d2353c.png";
import imgAvatarAbstract04 from "figma:asset/f10b0beb90c63012fc68d587fb84811d19f6de9e.png";
import imgAvatarFemale06 from "figma:asset/c9f57ed632bb8cc25900b65208e09c1f5b54c4f9.png";
import imgAvatarMale01 from "figma:asset/75de6b6155e04cbd5c1abff30c046ce691d9aa9e.png";
import imgAvatarFemale01 from "figma:asset/6ba83ceb607ab7b308d051e74bfadb66c5eeccc9.png";
import imgAvatarMale04 from "figma:asset/3a2730df63d15d35690a825e852c5c92287dbdf2.png";
import imgAvatarFemale04 from "figma:asset/4f050c9b8fef7a6b0cd6bf2b27fb91d4e9a924cc.png";
import imgAvatarFemale05 from "figma:asset/41af40dab5eb7a0b5862f532d3120b9471346f57.png";
import imgCMeLogo1 from "figma:asset/4557741263b78d5f41b15bb27c9a28c5430808c6.png";

function AvatarByewind() {
  return (
    <div className="bg-[rgba(0,0,0,0.04)] overflow-clip relative rounded-[80px] shrink-0 size-[24px]" data-name="AvatarByewind">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgAvatarByewind} />
    </div>
  );
}

function Icon() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <AvatarByewind />
    </div>
  );
}

function Text() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Will Barnett</p>
    </div>
  );
}

function ByeWind() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="ByeWind">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[8px] items-center p-[8px] relative w-full">
          <Icon />
          <Text />
        </div>
      </div>
    </div>
  );
}

function Line() {
  return (
    <div className="h-[4px] relative shrink-0 w-full" data-name="Line">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Line" opacity="0">
          <line id="Line_2" stroke="var(--stroke-0, black)" strokeLinecap="round" x1="0.5" x2="179.5" y1="1.5" y2="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Dot2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Dot2">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Dot2">
          <path d={svgPaths.p10453ef0} fill="var(--fill-0, black)" fillOpacity="0.2" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon1() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <Dot2 />
    </div>
  );
}

function Text1() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Dashboard</p>
    </div>
  );
}

function IconText() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Icon & Text">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[4px] items-center p-[8px] relative w-full">
          <Icon1 />
          <Text1 />
        </div>
      </div>
    </div>
  );
}

function Dot3() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Dot2">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Dot2">
          <path d={svgPaths.p10453ef0} fill="var(--fill-0, black)" fillOpacity="0.2" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon2() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <Dot3 />
    </div>
  );
}

function Text2() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Settings</p>
    </div>
  );
}

function IconText1() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Icon & Text">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[4px] items-center p-[8px] relative w-full">
          <Icon2 />
          <Text2 />
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start pb-[12px] pt-0 px-0 relative shrink-0 w-full" data-name="Frame">
      <ByeWind />
      <Line />
      <IconText />
      <IconText1 />
    </div>
  );
}

function Text3() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Text">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center px-[12px] py-[4px] relative w-full">
          <div className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.4)] w-full">
            <p className="mb-0">My profile</p>
            <p>&nbsp;</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowLineRightS() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="ArrowLineRight-s">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="ArrowLineRight-s">
          <path clipRule="evenodd" d={svgPaths.pefb9580} fill="var(--fill-0, black)" fillOpacity="0.2" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon3() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <ArrowLineRightS />
    </div>
  );
}

function IdentificationBadge() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="IdentificationBadge">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="IdentificationBadge">
          <path d={svgPaths.p28df90b2} fill="var(--fill-0, black)" id="Vector" opacity="0.08" />
          <path d={svgPaths.p72d2200} fill="var(--fill-0, black)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Icon4() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <IdentificationBadge />
    </div>
  );
}

function Text4() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">User Profile</p>
    </div>
  );
}

function IconText2() {
  return (
    <div className="basis-0 content-center flex flex-wrap gap-[8px] grow items-center min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Icon & Text">
      <Icon4 />
      <Text4 />
    </div>
  );
}

function Content() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[4px] items-center p-[8px] relative w-full">
          <Icon3 />
          <IconText2 />
        </div>
      </div>
    </div>
  );
}

function ArrowLineRightS1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="ArrowLineRight-s">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="ArrowLineRight-s">
          <path clipRule="evenodd" d={svgPaths.pefb9580} fill="var(--fill-0, black)" fillOpacity="0.2" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon5() {
  return (
    <div className="content-stretch flex items-center justify-center opacity-0 relative rounded-[8px] shrink-0" data-name="Icon">
      <ArrowLineRightS1 />
    </div>
  );
}

function DefaultIcon() {
  return (
    <div className="bg-[rgba(0,0,0,0.04)] relative rounded-[8px] shrink-0 size-[20px]" data-name="DefaultIcon">
      <div aria-hidden="true" className="absolute border-[0.5px] border-[rgba(0,0,0,0.8)] border-dashed inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Icon6() {
  return (
    <div className="content-stretch flex items-center justify-center opacity-0 relative rounded-[8px] shrink-0" data-name="Icon">
      <DefaultIcon />
    </div>
  );
}

function Text5() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Profile Overview</p>
    </div>
  );
}

function IconText3() {
  return (
    <div className="basis-0 content-center flex flex-wrap gap-[8px] grow items-center min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Icon & Text">
      <Icon6 />
      <Text5 />
    </div>
  );
}

function Content1() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[4px] items-center p-[8px] relative w-full">
          <Icon5 />
          <IconText3 />
        </div>
      </div>
    </div>
  );
}

function ArrowLineRightS2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="ArrowLineRight-s">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="ArrowLineRight-s">
          <path clipRule="evenodd" d={svgPaths.pefb9580} fill="var(--fill-0, black)" fillOpacity="0.2" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon7() {
  return (
    <div className="content-stretch flex items-center justify-center opacity-0 relative rounded-[8px] shrink-0" data-name="Icon">
      <ArrowLineRightS2 />
    </div>
  );
}

function DefaultIcon1() {
  return (
    <div className="bg-[rgba(0,0,0,0.04)] relative rounded-[8px] shrink-0 size-[20px]" data-name="DefaultIcon">
      <div aria-hidden="true" className="absolute border-[0.5px] border-[rgba(0,0,0,0.8)] border-dashed inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Icon8() {
  return (
    <div className="content-stretch flex items-center justify-center opacity-0 relative rounded-[8px] shrink-0" data-name="Icon">
      <DefaultIcon1 />
    </div>
  );
}

function Text6() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Signature Traits</p>
    </div>
  );
}

function IconText4() {
  return (
    <div className="basis-0 content-center flex flex-wrap gap-[8px] grow items-center min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Icon & Text">
      <Icon8 />
      <Text6 />
    </div>
  );
}

function Content2() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[4px] items-center p-[8px] relative w-full">
          <Icon7 />
          <IconText4 />
        </div>
      </div>
    </div>
  );
}

function ArrowLineRightS3() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="ArrowLineRight-s">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="ArrowLineRight-s">
          <path clipRule="evenodd" d={svgPaths.pefb9580} fill="var(--fill-0, black)" fillOpacity="0.2" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon9() {
  return (
    <div className="content-stretch flex items-center justify-center opacity-0 relative rounded-[8px] shrink-0" data-name="Icon">
      <ArrowLineRightS3 />
    </div>
  );
}

function DefaultIcon2() {
  return (
    <div className="bg-[rgba(0,0,0,0.04)] relative rounded-[8px] shrink-0 size-[20px]" data-name="DefaultIcon">
      <div aria-hidden="true" className="absolute border-[0.5px] border-[rgba(0,0,0,0.8)] border-dashed inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Icon10() {
  return (
    <div className="content-stretch flex items-center justify-center opacity-0 relative rounded-[8px] shrink-0" data-name="Icon">
      <DefaultIcon2 />
    </div>
  );
}

function Text7() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">{`Skills & Testing`}</p>
    </div>
  );
}

function IconText5() {
  return (
    <div className="basis-0 content-center flex flex-wrap gap-[8px] grow items-center min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Icon & Text">
      <Icon10 />
      <Text7 />
    </div>
  );
}

function Content3() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[4px] items-center p-[8px] relative w-full">
          <Icon9 />
          <IconText5 />
        </div>
      </div>
    </div>
  );
}

function ArrowLineRightS4() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="ArrowLineRight-s">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="ArrowLineRight-s">
          <path clipRule="evenodd" d={svgPaths.pefb9580} fill="var(--fill-0, black)" fillOpacity="0.2" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon11() {
  return (
    <div className="content-stretch flex items-center justify-center opacity-0 relative rounded-[8px] shrink-0" data-name="Icon">
      <ArrowLineRightS4 />
    </div>
  );
}

function DefaultIcon3() {
  return (
    <div className="bg-[rgba(0,0,0,0.04)] relative rounded-[8px] shrink-0 size-[20px]" data-name="DefaultIcon">
      <div aria-hidden="true" className="absolute border-[0.5px] border-[rgba(0,0,0,0.8)] border-dashed inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Icon12() {
  return (
    <div className="content-stretch flex items-center justify-center opacity-0 relative rounded-[8px] shrink-0" data-name="Icon">
      <DefaultIcon3 />
    </div>
  );
}

function Text8() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Deeper Insights</p>
    </div>
  );
}

function IconText6() {
  return (
    <div className="basis-0 content-center flex flex-wrap gap-[8px] grow items-center min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Icon & Text">
      <Icon12 />
      <Text8 />
    </div>
  );
}

function Content4() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[4px] items-center p-[8px] relative w-full">
          <Icon11 />
          <IconText6 />
        </div>
      </div>
    </div>
  );
}

function ArrowLineRightS5() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="ArrowLineRight-s">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="ArrowLineRight-s">
          <path clipRule="evenodd" d={svgPaths.pefb9580} fill="var(--fill-0, black)" fillOpacity="0.2" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon13() {
  return (
    <div className="content-stretch flex items-center justify-center opacity-0 relative rounded-[8px] shrink-0" data-name="Icon">
      <ArrowLineRightS5 />
    </div>
  );
}

function DefaultIcon4() {
  return (
    <div className="bg-[rgba(0,0,0,0.04)] relative rounded-[8px] shrink-0 size-[20px]" data-name="DefaultIcon">
      <div aria-hidden="true" className="absolute border-[0.5px] border-[rgba(0,0,0,0.8)] border-dashed inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Icon14() {
  return (
    <div className="content-stretch flex items-center justify-center opacity-0 relative rounded-[8px] shrink-0" data-name="Icon">
      <DefaultIcon4 />
    </div>
  );
}

function Text9() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Areas of Interest</p>
    </div>
  );
}

function IconText7() {
  return (
    <div className="basis-0 content-center flex flex-wrap gap-[8px] grow items-center min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Icon & Text">
      <Icon14 />
      <Text9 />
    </div>
  );
}

function Content5() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[4px] items-center p-[8px] relative w-full">
          <Icon13 />
          <IconText7 />
        </div>
      </div>
    </div>
  );
}

function Content6() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[4px] items-center p-[8px] w-full" />
      </div>
    </div>
  );
}

function ArrowLineRightS6() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="ArrowLineRight-s">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="ArrowLineRight-s">
          <path clipRule="evenodd" d={svgPaths.pefb9580} fill="var(--fill-0, black)" fillOpacity="0.2" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon15() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <ArrowLineRightS6 />
    </div>
  );
}

function UsersThree() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="UsersThree">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="UsersThree">
          <path d={svgPaths.p3906880} fill="var(--fill-0, black)" id="Vector" opacity="0.08" />
          <path d={svgPaths.p3d859c00} fill="var(--fill-0, black)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Icon16() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <UsersThree />
    </div>
  );
}

function Text10() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Learning Hub</p>
    </div>
  );
}

function IconText8() {
  return (
    <div className="basis-0 content-center flex flex-wrap gap-[8px] grow items-center min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Icon & Text">
      <Icon16 />
      <Text10 />
    </div>
  );
}

function Content7() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[4px] items-center p-[8px] relative w-full">
          <Icon15 />
          <IconText8 />
        </div>
      </div>
    </div>
  );
}

function ArrowLineRightS7() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="ArrowLineRight-s">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="ArrowLineRight-s">
          <path clipRule="evenodd" d={svgPaths.pefb9580} fill="var(--fill-0, black)" fillOpacity="0.2" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon17() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <ArrowLineRightS7 />
    </div>
  );
}

function ChatsTeardrop() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="ChatsTeardrop">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="ChatsTeardrop">
          <path d={svgPaths.p2b6cd800} fill="var(--fill-0, black)" id="Vector" opacity="0.08" />
          <path d={svgPaths.p36651b00} fill="var(--fill-0, black)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Icon18() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <ChatsTeardrop />
    </div>
  );
}

function Text11() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Social</p>
    </div>
  );
}

function IconText9() {
  return (
    <div className="basis-0 content-center flex flex-wrap gap-[8px] grow items-center min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Icon & Text">
      <Icon18 />
      <Text11 />
    </div>
  );
}

function Content8() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[4px] items-center p-[8px] relative w-full">
          <Icon17 />
          <IconText9 />
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start pb-[12px] pt-0 px-0 relative shrink-0 w-full" data-name="Frame">
      <Text3 />
      <Content />
      <Content1 />
      <Content2 />
      <Content3 />
      <Content4 />
      <Content5 />
      <Content6 />
      <Content7 />
      <Content8 />
    </div>
  );
}

function Logo() {
  return <div className="absolute backdrop-blur-[20px] backdrop-filter bottom-[20px] content-stretch flex flex-col items-center left-1/2 p-[8px] rounded-[8px] translate-x-[-50%] w-[180px]" data-name="Logo" />;
}

function Sidebar() {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col gap-[8px] items-center left-[9px] p-[16px] top-0 w-[212px]" data-name="Sidebar">
      <div aria-hidden="true" className="absolute border-[0px_0.5px_0px_0px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <Frame />
      <Frame1 />
      <Logo />
    </div>
  );
}

function ArrowLineRightS8() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="ArrowLineRight-s">
      <div className="absolute bottom-[-56.25%] left-0 right-[-31.25%] top-0">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 25">
          <g id="ArrowLineRight-s">
            <path clipRule="evenodd" d={svgPaths.pbe9ba00} fill="var(--fill-0, black)" fillOpacity="0.2" fillRule="evenodd" id="Vector" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Icon19() {
  return (
    <div className="content-stretch flex items-center justify-center opacity-0 relative rounded-[8px] shrink-0" data-name="Icon">
      <ArrowLineRightS8 />
    </div>
  );
}

function DefaultIcon5() {
  return (
    <div className="bg-[rgba(0,0,0,0.04)] relative rounded-[8px] shrink-0 size-[20px]" data-name="DefaultIcon">
      <div aria-hidden="true" className="absolute border-[0.5px] border-[rgba(0,0,0,0.8)] border-dashed inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Icon20() {
  return (
    <div className="content-stretch flex items-center justify-center opacity-0 relative rounded-[8px] shrink-0" data-name="Icon">
      <DefaultIcon5 />
    </div>
  );
}

function Text12() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">History</p>
    </div>
  );
}

function IconText10() {
  return (
    <div className="basis-0 content-center flex flex-wrap gap-[8px] grow items-center min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Icon & Text">
      <Icon20 />
      <Text12 />
    </div>
  );
}

function Content9() {
  return (
    <div className="absolute content-center flex flex-wrap gap-[4px] items-center left-[25px] p-[8px] rounded-[12px] top-[452px] w-[180px]" data-name="Content">
      <Icon19 />
      <IconText10 />
    </div>
  );
}

function Text13() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-center min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Notifications</p>
    </div>
  );
}

function ContentText() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content/Text">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[8px] items-center px-[4px] py-[8px] relative w-full">
          <Text13 />
        </div>
      </div>
    </div>
  );
}

function BugBeetle() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="BugBeetle">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="BugBeetle">
          <path d={svgPaths.pb668c00} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon21() {
  return (
    <div className="bg-[#edeefc] content-stretch flex items-center justify-center p-[4px] relative rounded-[8px] shrink-0" data-name="Icon">
      <BugBeetle />
    </div>
  );
}

function Text14() {
  return (
    <div className="basis-0 content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal grow items-start justify-center min-h-px min-w-px not-italic relative rounded-[12px] shrink-0" data-name="Text">
      <p className="[white-space-collapse:collapse] leading-[20px] overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-black text-nowrap w-full">You fixed a bug.</p>
      <p className="leading-[16px] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.4)] w-full">Just now</p>
    </div>
  );
}

function Content10() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <div className="size-full">
        <div className="content-start flex flex-wrap gap-[8px] items-start p-[8px] relative w-full">
          <Icon21 />
          <Text14 />
        </div>
      </div>
    </div>
  );
}

function User() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="User">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="User">
          <path d={svgPaths.p25bb0000} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon22() {
  return (
    <div className="bg-[#e6f1fd] content-stretch flex items-center justify-center p-[4px] relative rounded-[8px] shrink-0" data-name="Icon">
      <User />
    </div>
  );
}

function Text15() {
  return (
    <div className="basis-0 content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal grow items-start justify-center min-h-px min-w-px not-italic relative rounded-[12px] shrink-0" data-name="Text">
      <p className="[white-space-collapse:collapse] leading-[20px] overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-black text-nowrap w-full">New user registeRed.</p>
      <p className="leading-[16px] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.4)] w-full">59 minutes ago</p>
    </div>
  );
}

function Content11() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <div className="size-full">
        <div className="content-start flex flex-wrap gap-[8px] items-start p-[8px] relative w-full">
          <Icon22 />
          <Text15 />
        </div>
      </div>
    </div>
  );
}

function BugBeetle1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="BugBeetle">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="BugBeetle">
          <path d={svgPaths.pb668c00} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon23() {
  return (
    <div className="bg-[#edeefc] content-stretch flex items-center justify-center p-[4px] relative rounded-[8px] shrink-0" data-name="Icon">
      <BugBeetle1 />
    </div>
  );
}

function Text16() {
  return (
    <div className="basis-0 content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal grow items-start justify-center min-h-px min-w-px not-italic relative rounded-[12px] shrink-0" data-name="Text">
      <p className="[white-space-collapse:collapse] leading-[20px] overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-black text-nowrap w-full">You fixed a bug.</p>
      <p className="leading-[16px] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.4)] w-full">12 hours ago</p>
    </div>
  );
}

function Content12() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <div className="size-full">
        <div className="content-start flex flex-wrap gap-[8px] items-start p-[8px] relative w-full">
          <Icon23 />
          <Text16 />
        </div>
      </div>
    </div>
  );
}

function Broadcast() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Broadcast">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Broadcast">
          <path d={svgPaths.p3b3f2400} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon24() {
  return (
    <div className="bg-[#e6f1fd] content-stretch flex items-center justify-center p-[4px] relative rounded-[8px] shrink-0" data-name="Icon">
      <Broadcast />
    </div>
  );
}

function Text17() {
  return (
    <div className="basis-0 content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal grow items-start justify-center min-h-px min-w-px not-italic relative rounded-[12px] shrink-0" data-name="Text">
      <p className="[white-space-collapse:collapse] leading-[20px] overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-black text-nowrap w-full">Andi Lane subscribed to you.</p>
      <p className="leading-[16px] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.4)] w-full">Today, 11:59 AM</p>
    </div>
  );
}

function Content13() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <div className="size-full">
        <div className="content-start flex flex-wrap gap-[8px] items-start p-[8px] relative w-full">
          <Icon24 />
          <Text17 />
        </div>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Frame">
      <ContentText />
      <Content10 />
      <Content11 />
      <Content12 />
      <Content13 />
    </div>
  );
}

function Text18() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-center min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Activities</p>
    </div>
  );
}

function ContentText1() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content/Text">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[8px] items-center px-[4px] py-[8px] relative w-full">
          <Text18 />
        </div>
      </div>
    </div>
  );
}

function AvatarAbstract() {
  return (
    <div className="bg-[rgba(0,0,0,0.04)] overflow-clip relative rounded-[80px] shrink-0 size-[24px]" data-name="AvatarAbstract03">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgAvatarAbstract03} />
    </div>
  );
}

function Icon25() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <AvatarAbstract />
    </div>
  );
}

function Text19() {
  return (
    <div className="basis-0 content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal grow items-start justify-center min-h-px min-w-px not-italic relative rounded-[12px] shrink-0" data-name="Text">
      <p className="[white-space-collapse:collapse] leading-[20px] overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-black text-nowrap w-full">Changed the style.</p>
      <p className="leading-[16px] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.4)] w-full">Just now</p>
    </div>
  );
}

function Content14() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <div className="size-full">
        <div className="content-start flex flex-wrap gap-[8px] items-start p-[8px] relative w-full">
          <Icon25 />
          <Text19 />
        </div>
      </div>
    </div>
  );
}

function AvatarFemale1() {
  return (
    <div className="bg-[rgba(0,0,0,0.04)] overflow-clip relative rounded-[80px] shrink-0 size-[24px]" data-name="AvatarFemale03">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgAvatarFemale03} />
    </div>
  );
}

function Icon26() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <AvatarFemale1 />
    </div>
  );
}

function Text20() {
  return (
    <div className="basis-0 content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal grow items-start justify-center min-h-px min-w-px not-italic relative rounded-[12px] shrink-0" data-name="Text">
      <p className="[white-space-collapse:collapse] leading-[20px] overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-black text-nowrap w-full">Released a new version.</p>
      <p className="leading-[16px] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.4)] w-full">59 minutes ago</p>
    </div>
  );
}

function Content15() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <div className="size-full">
        <div className="content-start flex flex-wrap gap-[8px] items-start p-[8px] relative w-full">
          <Icon26 />
          <Text20 />
        </div>
      </div>
    </div>
  );
}

function AvatarMale1() {
  return (
    <div className="bg-[rgba(0,0,0,0.04)] overflow-clip relative rounded-[80px] shrink-0 size-[24px]" data-name="AvatarMale02">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgAvatarMale02} />
    </div>
  );
}

function Icon27() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <AvatarMale1 />
    </div>
  );
}

function Text21() {
  return (
    <div className="basis-0 content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal grow items-start justify-center min-h-px min-w-px not-italic relative rounded-[12px] shrink-0" data-name="Text">
      <p className="[white-space-collapse:collapse] leading-[20px] overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-black text-nowrap w-full">Submitted a bug.</p>
      <p className="leading-[16px] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.4)] w-full">12 hours ago</p>
    </div>
  );
}

function Content16() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <div className="size-full">
        <div className="content-start flex flex-wrap gap-[8px] items-start p-[8px] relative w-full">
          <Icon27 />
          <Text21 />
        </div>
      </div>
    </div>
  );
}

function Avatar3D() {
  return (
    <div className="bg-[rgba(0,0,0,0.04)] overflow-clip relative rounded-[80px] shrink-0 size-[24px]" data-name="Avatar3d03">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgAvatar3D03} />
    </div>
  );
}

function Icon28() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <Avatar3D />
    </div>
  );
}

function Text22() {
  return (
    <div className="basis-0 content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal grow items-start justify-center min-h-px min-w-px not-italic relative rounded-[12px] shrink-0" data-name="Text">
      <p className="[white-space-collapse:collapse] leading-[20px] overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-black text-nowrap w-full">Modified A data in Page X.</p>
      <p className="leading-[16px] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.4)] w-full">Today, 11:59 AM</p>
    </div>
  );
}

function Content17() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <div className="size-full">
        <div className="content-start flex flex-wrap gap-[8px] items-start p-[8px] relative w-full">
          <Icon28 />
          <Text22 />
        </div>
      </div>
    </div>
  );
}

function AvatarAbstract1() {
  return (
    <div className="bg-[rgba(0,0,0,0.04)] overflow-clip relative rounded-[80px] shrink-0 size-[24px]" data-name="AvatarAbstract04">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgAvatarAbstract04} />
    </div>
  );
}

function Icon29() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <AvatarAbstract1 />
    </div>
  );
}

function Text23() {
  return (
    <div className="basis-0 content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal grow items-start justify-center min-h-px min-w-px not-italic relative rounded-[12px] shrink-0" data-name="Text">
      <p className="[white-space-collapse:collapse] leading-[20px] overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-black text-nowrap w-full">Deleted a page in Project X.</p>
      <p className="leading-[16px] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.4)] w-full">Feb 2, 2025</p>
    </div>
  );
}

function Content18() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <div className="size-full">
        <div className="content-start flex flex-wrap gap-[8px] items-start p-[8px] relative w-full">
          <Icon29 />
          <Text23 />
        </div>
      </div>
    </div>
  );
}

function Strip() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[40px] h-[186px] items-center left-[19px] overflow-clip top-[79px] w-px" data-name="Strip">
      <div className="basis-0 bg-[rgba(0,0,0,0.1)] grow min-h-px min-w-px rounded-[80px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[rgba(0,0,0,0.1)] grow min-h-px min-w-px rounded-[80px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[rgba(0,0,0,0.1)] grow min-h-px min-w-px rounded-[80px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[rgba(0,0,0,0.1)] grow min-h-px min-w-px rounded-[80px] shrink-0 w-full" data-name="Rectangle" />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Frame">
      <ContentText1 />
      <Content14 />
      <Content15 />
      <Content16 />
      <Content17 />
      <Content18 />
      <Strip />
    </div>
  );
}

function Text24() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-center min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Contacts</p>
    </div>
  );
}

function ContentText2() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Content/Text">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[8px] items-center px-[4px] py-[8px] relative w-full">
          <Text24 />
        </div>
      </div>
    </div>
  );
}

function AvatarFemale4() {
  return (
    <div className="bg-[rgba(0,0,0,0.04)] overflow-clip relative rounded-[80px] shrink-0 size-[24px]" data-name="AvatarFemale06">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgAvatarFemale06} />
    </div>
  );
}

function Icon30() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <AvatarFemale4 />
    </div>
  );
}

function Text25() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Natali Craig</p>
    </div>
  );
}

function NataliCraig() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="NataliCraig">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[8px] items-center p-[8px] relative w-full">
          <Icon30 />
          <Text25 />
        </div>
      </div>
    </div>
  );
}

function AvatarMale() {
  return (
    <div className="bg-[rgba(0,0,0,0.04)] overflow-clip relative rounded-[80px] shrink-0 size-[24px]" data-name="AvatarMale01">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgAvatarMale01} />
    </div>
  );
}

function Icon31() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <AvatarMale />
    </div>
  );
}

function Text26() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Drew Cano</p>
    </div>
  );
}

function DrewCano() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="DrewCano">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[8px] items-center p-[8px] relative w-full">
          <Icon31 />
          <Text26 />
        </div>
      </div>
    </div>
  );
}

function AvatarFemale() {
  return (
    <div className="bg-[rgba(0,0,0,0.04)] overflow-clip relative rounded-[80px] shrink-0 size-[24px]" data-name="AvatarFemale01">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgAvatarFemale01} />
    </div>
  );
}

function Icon32() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <AvatarFemale />
    </div>
  );
}

function Text27() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Andi Lane</p>
    </div>
  );
}

function AndiLane() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="AndiLane">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[8px] items-center p-[8px] relative w-full">
          <Icon32 />
          <Text27 />
        </div>
      </div>
    </div>
  );
}

function AvatarMale2() {
  return (
    <div className="bg-[rgba(0,0,0,0.04)] overflow-clip relative rounded-[80px] shrink-0 size-[24px]" data-name="AvatarMale04">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgAvatarMale04} />
    </div>
  );
}

function Icon33() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <AvatarMale2 />
    </div>
  );
}

function Text28() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Koray Okumus</p>
    </div>
  );
}

function KorayOkumus() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="KorayOkumus">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[8px] items-center p-[8px] relative w-full">
          <Icon33 />
          <Text28 />
        </div>
      </div>
    </div>
  );
}

function AvatarFemale2() {
  return (
    <div className="bg-[rgba(0,0,0,0.04)] overflow-clip relative rounded-[80px] shrink-0 size-[24px]" data-name="AvatarFemale04">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgAvatarFemale04} />
    </div>
  );
}

function Icon34() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <AvatarFemale2 />
    </div>
  );
}

function Text29() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Kate Morrison</p>
    </div>
  );
}

function KateMorrison() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="KateMorrison">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[8px] items-center p-[8px] relative w-full">
          <Icon34 />
          <Text29 />
        </div>
      </div>
    </div>
  );
}

function AvatarFemale3() {
  return (
    <div className="bg-[rgba(0,0,0,0.04)] overflow-clip relative rounded-[80px] shrink-0 size-[24px]" data-name="AvatarFemale05">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgAvatarFemale05} />
    </div>
  );
}

function Icon35() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <AvatarFemale3 />
    </div>
  );
}

function Text30() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Melody Macy</p>
    </div>
  );
}

function MelodyMacy() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="MelodyMacy">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-[8px] items-center p-[8px] relative w-full">
          <Icon35 />
          <Text30 />
        </div>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Frame">
      <ContentText2 />
      <NataliCraig />
      <DrewCano />
      <AndiLane />
      <KorayOkumus />
      <KateMorrison />
      <MelodyMacy />
    </div>
  );
}

function RightBar() {
  return (
    <div className="absolute bottom-0 right-0 top-0 w-[280px]" data-name="Right Bar">
      <div className="content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[16px] relative rounded-[inherit] size-full">
        <Frame2 />
        <Frame3 />
        <Frame4 />
      </div>
      <div aria-hidden="true" className="absolute border-[0px_0px_0px_0.5px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Sidebar1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Sidebar">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Sidebar">
          <path d={svgPaths.p35eb2e00} fill="var(--fill-0, black)" id="Vector" opacity="0.08" />
          <path d={svgPaths.p242dc00} fill="var(--fill-0, black)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Icon36() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <Sidebar1 />
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex items-center justify-center min-h-[28px] min-w-[28px] p-[4px] relative rounded-[16px] shrink-0" data-name="Button">
      <Icon36 />
    </div>
  );
}

function Star() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Star">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Star">
          <path d={svgPaths.p3b304d00} fill="var(--fill-0, black)" id="Vector" opacity="0.08" />
          <path d={svgPaths.p28d8f780} fill="var(--fill-0, black)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Icon37() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <Star />
    </div>
  );
}

function Button1() {
  return (
    <div className="content-stretch flex items-center justify-center min-h-[28px] min-w-[28px] p-[4px] relative rounded-[16px] shrink-0" data-name="Button">
      <Icon37 />
    </div>
  );
}

function Group() {
  return (
    <div className="content-center flex flex-wrap gap-[8px] items-center relative rounded-[8px] shrink-0" data-name="Group">
      <Button />
      <Button1 />
    </div>
  );
}

function Text31() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.4)] text-center w-full">
        <p className="leading-[20px]">Dashboards</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex items-center justify-center px-[12px] py-[4px] relative rounded-[16px] shrink-0" data-name="Button">
      <Text31 />
    </div>
  );
}

function Text32() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.1)] w-full">/</p>
    </div>
  );
}

function Text33() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black text-center w-full">
        <p className="leading-[20px]">Default</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="content-stretch flex items-center justify-center px-[12px] py-[4px] relative rounded-[16px] shrink-0" data-name="Button">
      <Text33 />
    </div>
  );
}

function Breadcrumb() {
  return (
    <div className="content-center flex flex-wrap gap-[8px] items-center relative rounded-[8px] shrink-0" data-name="Breadcrumb">
      <Button2 />
      <Text32 />
      <Button3 />
    </div>
  );
}

function IconBreadcrumb() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Icon-Breadcrumb">
      <Group />
      <Breadcrumb />
    </div>
  );
}

function SearchIcon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SearchIcon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SearchIcon">
          <path d={svgPaths.p926fd00} fill="var(--fill-0, black)" fillOpacity="0.2" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon38() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <SearchIcon />
    </div>
  );
}

function Text34() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.2)] w-full">Search</p>
    </div>
  );
}

function IconText11() {
  return (
    <div className="basis-0 content-center flex flex-wrap gap-[8px] grow items-center min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Icon & Text">
      <Icon38 />
      <Text34 />
    </div>
  );
}

function Text35() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[4px] shrink-0 w-[20px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[0.5px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-[rgba(0,0,0,0.2)] text-center w-full">/</p>
    </div>
  );
}

function Search() {
  return (
    <div className="bg-[rgba(0,0,0,0.04)] content-center flex flex-wrap gap-[8px] items-center overflow-clip px-[8px] py-[4px] relative rounded-[16px] shrink-0 w-[160px]" data-name="Search">
      <IconText11 />
      <Text35 />
    </div>
  );
}

function Sun() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Sun">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Sun">
          <path d={svgPaths.p22158980} fill="var(--fill-0, black)" id="Vector" opacity="0.08" />
          <path d={svgPaths.peb9db00} fill="var(--fill-0, black)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Icon39() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <Sun />
    </div>
  );
}

function Button4() {
  return (
    <div className="content-stretch flex items-center justify-center min-h-[28px] min-w-[28px] p-[4px] relative rounded-[16px] shrink-0" data-name="Button">
      <Icon39 />
    </div>
  );
}

function ClockCounterClockwise() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="ClockCounterClockwise">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="ClockCounterClockwise">
          <path d={svgPaths.p2db7c980} fill="var(--fill-0, black)" id="Vector" opacity="0.08" />
          <path d={svgPaths.p2ce590f0} fill="var(--fill-0, black)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Icon40() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <ClockCounterClockwise />
    </div>
  );
}

function Button5() {
  return (
    <div className="content-stretch flex items-center justify-center min-h-[28px] min-w-[28px] p-[4px] relative rounded-[16px] shrink-0" data-name="Button">
      <Icon40 />
    </div>
  );
}

function Bell() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Bell">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Bell">
          <path d={svgPaths.pa727280} fill="var(--fill-0, black)" id="Vector" opacity="0.08" />
          <path d={svgPaths.p382cc980} fill="var(--fill-0, black)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Icon41() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <Bell />
    </div>
  );
}

function Button6() {
  return (
    <div className="content-stretch flex items-center justify-center min-h-[28px] min-w-[28px] p-[4px] relative rounded-[16px] shrink-0" data-name="Button">
      <Icon41 />
    </div>
  );
}

function Sidebar2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Sidebar">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Sidebar">
          <path d={svgPaths.p35eb2e00} fill="var(--fill-0, black)" id="Vector" opacity="0.08" />
          <path d={svgPaths.p242dc00} fill="var(--fill-0, black)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Icon42() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <Sidebar2 />
    </div>
  );
}

function Button7() {
  return (
    <div className="content-stretch flex items-center justify-center min-h-[28px] min-w-[28px] p-[4px] relative rounded-[16px] shrink-0" data-name="Button">
      <Icon42 />
    </div>
  );
}

function Group1() {
  return (
    <div className="content-center flex flex-wrap gap-[8px] items-center justify-end relative rounded-[8px] shrink-0" data-name="Group">
      <Button4 />
      <Button5 />
      <Button6 />
      <Button7 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[20px] items-start relative shrink-0" data-name="Frame">
      <Search />
      <Group1 />
    </div>
  );
}

function Header() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-[212px] px-[28px] py-[20px] right-[280px] top-0" data-name="Header">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.5px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <IconBreadcrumb />
      <Frame5 />
    </div>
  );
}

function Text36() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0 w-full" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal h-[20px] leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Views</p>
    </div>
  );
}

function Number() {
  return (
    <div className="h-[36px] relative shrink-0 w-[16px]" data-name="Number">
      <div className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[36px] left-0 not-italic text-[#1c1c1c] text-[24px] text-nowrap top-[-252px] whitespace-pre">
        <p className="mb-0">0</p>
        <p className="mb-0">1</p>
        <p className="mb-0">2</p>
        <p className="mb-0">3</p>
        <p className="mb-0">4</p>
        <p className="mb-0">5</p>
        <p className="mb-0">6</p>
        <p className="mb-0">7</p>
        <p className="mb-0">8</p>
        <p className="mb-0">9</p>
        <p>0</p>
      </div>
    </div>
  );
}

function Number1() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="Number">
      <Number />
    </div>
  );
}

function RollNumbers() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Roll numbers">
      <Number1 />
    </div>
  );
}

function Number2() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="Number">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[36px] not-italic relative shrink-0 text-[#1c1c1c] text-[24px] text-nowrap whitespace-pre">,</p>
    </div>
  );
}

function RollNumbers1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Roll numbers">
      <Number2 />
    </div>
  );
}

function Number3() {
  return (
    <div className="h-[36px] relative shrink-0 w-[16px]" data-name="Number">
      <div className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[36px] left-0 not-italic text-[#1c1c1c] text-[24px] text-nowrap top-[-72px] whitespace-pre">
        <p className="mb-0">0</p>
        <p className="mb-0">1</p>
        <p className="mb-0">2</p>
        <p className="mb-0">3</p>
        <p className="mb-0">4</p>
        <p className="mb-0">5</p>
        <p className="mb-0">6</p>
        <p className="mb-0">7</p>
        <p className="mb-0">8</p>
        <p className="mb-0">9</p>
        <p>0</p>
      </div>
    </div>
  );
}

function Number4() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="Number">
      <Number3 />
    </div>
  );
}

function RollNumbers2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Roll numbers">
      <Number4 />
    </div>
  );
}

function Number5() {
  return (
    <div className="h-[36px] relative shrink-0 w-[16px]" data-name="Number">
      <div className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[36px] left-0 not-italic text-[#1c1c1c] text-[24px] text-nowrap top-[-216px] whitespace-pre">
        <p className="mb-0">0</p>
        <p className="mb-0">1</p>
        <p className="mb-0">2</p>
        <p className="mb-0">3</p>
        <p className="mb-0">4</p>
        <p className="mb-0">5</p>
        <p className="mb-0">6</p>
        <p className="mb-0">7</p>
        <p className="mb-0">8</p>
        <p className="mb-0">9</p>
        <p>0</p>
      </div>
    </div>
  );
}

function Number6() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="Number">
      <Number5 />
    </div>
  );
}

function RollNumbers3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Roll numbers">
      <Number6 />
    </div>
  );
}

function Number7() {
  return (
    <div className="h-[36px] relative shrink-0 w-[16px]" data-name="Number">
      <div className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[36px] left-0 not-italic text-[#1c1c1c] text-[24px] text-nowrap top-[-180px] whitespace-pre">
        <p className="mb-0">0</p>
        <p className="mb-0">1</p>
        <p className="mb-0">2</p>
        <p className="mb-0">3</p>
        <p className="mb-0">4</p>
        <p className="mb-0">5</p>
        <p className="mb-0">6</p>
        <p className="mb-0">7</p>
        <p className="mb-0">8</p>
        <p className="mb-0">9</p>
        <p>0</p>
      </div>
    </div>
  );
}

function Number8() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="Number">
      <Number7 />
    </div>
  );
}

function RollNumbers4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Roll numbers">
      <Number8 />
    </div>
  );
}

function RollingNumber() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Rolling number">
      <RollNumbers />
      <RollNumbers1 />
      <RollNumbers2 />
      <RollNumbers3 />
      <RollNumbers4 />
    </div>
  );
}

function Text37() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-black w-full">+11.01%</p>
    </div>
  );
}

function ArrowRise() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="ArrowRise">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="ArrowRise">
          <path clipRule="evenodd" d={svgPaths.pb846800} fill="var(--fill-0, black)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon43() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <ArrowRise />
    </div>
  );
}

function IconText12() {
  return (
    <div className="basis-0 content-center flex flex-wrap gap-[8px] grow items-center justify-end min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Icon & Text">
      <Text37 />
      <Icon43 />
    </div>
  );
}

function Content19() {
  return (
    <div className="content-center flex flex-wrap gap-[8px] items-center justify-between relative rounded-[8px] shrink-0 w-full" data-name="Content">
      <RollingNumber />
      <IconText12 />
    </div>
  );
}

function Card() {
  return (
    <div className="basis-0 bg-[#7dbbff] grow min-h-px min-w-[200px] relative rounded-[20px] shrink-0" data-name="Card">
      <div className="min-w-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[8px] items-start min-w-[inherit] p-[24px] relative w-full">
          <Text36 />
          <Content19 />
        </div>
      </div>
    </div>
  );
}

function Text38() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',sans-serif] font-normal grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-black w-full">Visits</p>
    </div>
  );
}

function Number9() {
  return (
    <div className="h-[36px] relative shrink-0 w-[16px]" data-name="Number">
      <div className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[36px] left-0 not-italic text-[#1c1c1c] text-[24px] text-nowrap top-[-108px] whitespace-pre">
        <p className="mb-0">0</p>
        <p className="mb-0">1</p>
        <p className="mb-0">2</p>
        <p className="mb-0">3</p>
        <p className="mb-0">4</p>
        <p className="mb-0">5</p>
        <p className="mb-0">6</p>
        <p className="mb-0">7</p>
        <p className="mb-0">8</p>
        <p className="mb-0">9</p>
        <p>0</p>
      </div>
    </div>
  );
}

function Number10() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="Number">
      <Number9 />
    </div>
  );
}

function RollNumbers5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Roll numbers">
      <Number10 />
    </div>
  );
}

function Number11() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="Number">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[36px] not-italic relative shrink-0 text-[#1c1c1c] text-[24px] text-nowrap whitespace-pre">,</p>
    </div>
  );
}

function RollNumbers6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Roll numbers">
      <Number11 />
    </div>
  );
}

function Number12() {
  return (
    <div className="h-[36px] relative shrink-0 w-[16px]" data-name="Number">
      <div className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[36px] left-0 not-italic text-[#1c1c1c] text-[24px] text-nowrap top-[-216px] whitespace-pre">
        <p className="mb-0">0</p>
        <p className="mb-0">1</p>
        <p className="mb-0">2</p>
        <p className="mb-0">3</p>
        <p className="mb-0">4</p>
        <p className="mb-0">5</p>
        <p className="mb-0">6</p>
        <p className="mb-0">7</p>
        <p className="mb-0">8</p>
        <p className="mb-0">9</p>
        <p>0</p>
      </div>
    </div>
  );
}

function Number13() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="Number">
      <Number12 />
    </div>
  );
}

function RollNumbers7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Roll numbers">
      <Number13 />
    </div>
  );
}

function Number14() {
  return (
    <div className="h-[36px] relative shrink-0 w-[16px]" data-name="Number">
      <div className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[36px] left-0 not-italic text-[#1c1c1c] text-[24px] text-nowrap top-[-252px] whitespace-pre">
        <p className="mb-0">0</p>
        <p className="mb-0">1</p>
        <p className="mb-0">2</p>
        <p className="mb-0">3</p>
        <p className="mb-0">4</p>
        <p className="mb-0">5</p>
        <p className="mb-0">6</p>
        <p className="mb-0">7</p>
        <p className="mb-0">8</p>
        <p className="mb-0">9</p>
        <p>0</p>
      </div>
    </div>
  );
}

function Number15() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="Number">
      <Number14 />
    </div>
  );
}

function RollNumbers8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Roll numbers">
      <Number15 />
    </div>
  );
}

function Number16() {
  return (
    <div className="h-[36px] relative shrink-0 w-[16px]" data-name="Number">
      <div className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[36px] left-0 not-italic text-[#1c1c1c] text-[24px] text-nowrap top-[-36px] whitespace-pre">
        <p className="mb-0">0</p>
        <p className="mb-0">1</p>
        <p className="mb-0">2</p>
        <p className="mb-0">3</p>
        <p className="mb-0">4</p>
        <p className="mb-0">5</p>
        <p className="mb-0">6</p>
        <p className="mb-0">7</p>
        <p className="mb-0">8</p>
        <p className="mb-0">9</p>
        <p>0</p>
      </div>
    </div>
  );
}

function Number17() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="Number">
      <Number16 />
    </div>
  );
}

function RollNumbers9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Roll numbers">
      <Number17 />
    </div>
  );
}

function RollingNumber1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Rolling number">
      <RollNumbers5 />
      <RollNumbers6 />
      <RollNumbers7 />
      <RollNumbers8 />
      <RollNumbers9 />
    </div>
  );
}

function Text39() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-black w-full">-0.03%</p>
    </div>
  );
}

function ArrowFall() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="ArrowFall">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="ArrowFall">
          <path clipRule="evenodd" d={svgPaths.p1280aaf2} fill="var(--fill-0, black)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon44() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <ArrowFall />
    </div>
  );
}

function IconText13() {
  return (
    <div className="basis-0 content-center flex flex-wrap gap-[8px] grow items-center justify-end min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Icon & Text">
      <Text39 />
      <Icon44 />
    </div>
  );
}

function Content20() {
  return (
    <div className="content-center flex flex-wrap gap-[8px] items-center justify-between relative rounded-[8px] shrink-0 w-full" data-name="Content">
      <RollingNumber1 />
      <IconText13 />
    </div>
  );
}

function Card1() {
  return (
    <div className="basis-0 bg-[#7dbbff] grow min-h-px min-w-[200px] relative rounded-[20px] shrink-0" data-name="Card">
      <div className="min-w-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[8px] items-start min-w-[inherit] p-[24px] relative w-full">
          <Text38 />
          <Content20 />
        </div>
      </div>
    </div>
  );
}

function Text40() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0 w-full" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal h-[20px] leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">New Users</p>
    </div>
  );
}

function Number18() {
  return (
    <div className="h-[36px] relative shrink-0 w-[16px]" data-name="Number">
      <div className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[36px] left-0 not-italic text-[#1c1c1c] text-[24px] text-nowrap top-[-36px] whitespace-pre">
        <p className="mb-0">0</p>
        <p className="mb-0">1</p>
        <p className="mb-0">2</p>
        <p className="mb-0">3</p>
        <p className="mb-0">4</p>
        <p className="mb-0">5</p>
        <p className="mb-0">6</p>
        <p className="mb-0">7</p>
        <p className="mb-0">8</p>
        <p className="mb-0">9</p>
        <p>0</p>
      </div>
    </div>
  );
}

function Number19() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="Number">
      <Number18 />
    </div>
  );
}

function RollNumbers10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Roll numbers">
      <Number19 />
    </div>
  );
}

function Number20() {
  return (
    <div className="h-[36px] relative shrink-0 w-[16px]" data-name="Number">
      <div className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[36px] left-0 not-italic text-[#1c1c1c] text-[24px] text-nowrap top-[-180px] whitespace-pre">
        <p className="mb-0">0</p>
        <p className="mb-0">1</p>
        <p className="mb-0">2</p>
        <p className="mb-0">3</p>
        <p className="mb-0">4</p>
        <p className="mb-0">5</p>
        <p className="mb-0">6</p>
        <p className="mb-0">7</p>
        <p className="mb-0">8</p>
        <p className="mb-0">9</p>
        <p>0</p>
      </div>
    </div>
  );
}

function Number21() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="Number">
      <Number20 />
    </div>
  );
}

function RollNumbers11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Roll numbers">
      <Number21 />
    </div>
  );
}

function Number22() {
  return (
    <div className="h-[36px] relative shrink-0 w-[16px]" data-name="Number">
      <div className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[36px] left-0 not-italic text-[#1c1c1c] text-[24px] text-nowrap top-[-216px] whitespace-pre">
        <p className="mb-0">0</p>
        <p className="mb-0">1</p>
        <p className="mb-0">2</p>
        <p className="mb-0">3</p>
        <p className="mb-0">4</p>
        <p className="mb-0">5</p>
        <p className="mb-0">6</p>
        <p className="mb-0">7</p>
        <p className="mb-0">8</p>
        <p className="mb-0">9</p>
        <p>0</p>
      </div>
    </div>
  );
}

function Number23() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="Number">
      <Number22 />
    </div>
  );
}

function RollNumbers12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Roll numbers">
      <Number23 />
    </div>
  );
}

function RollingNumber2() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Rolling number">
      <RollNumbers10 />
      <RollNumbers11 />
      <RollNumbers12 />
    </div>
  );
}

function Text41() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-black w-full">+15.03%</p>
    </div>
  );
}

function ArrowRise1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="ArrowRise">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="ArrowRise">
          <path clipRule="evenodd" d={svgPaths.pb846800} fill="var(--fill-0, black)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon45() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <ArrowRise1 />
    </div>
  );
}

function IconText14() {
  return (
    <div className="basis-0 content-center flex flex-wrap gap-[8px] grow items-center justify-end min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Icon & Text">
      <Text41 />
      <Icon45 />
    </div>
  );
}

function Content21() {
  return (
    <div className="content-center flex flex-wrap gap-[8px] items-center justify-between relative rounded-[8px] shrink-0 w-full" data-name="Content">
      <RollingNumber2 />
      <IconText14 />
    </div>
  );
}

function Card2() {
  return (
    <div className="basis-0 bg-[#7dbbff] grow min-h-px min-w-[200px] relative rounded-[20px] shrink-0" data-name="Card">
      <div className="min-w-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[8px] items-start min-w-[inherit] p-[24px] relative w-full">
          <Text40 />
          <Content21 />
        </div>
      </div>
    </div>
  );
}

function Text42() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',sans-serif] font-normal grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-black w-full">Active Users</p>
    </div>
  );
}

function Number24() {
  return (
    <div className="h-[36px] relative shrink-0 w-[16px]" data-name="Number">
      <div className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[36px] left-0 not-italic text-[#1c1c1c] text-[24px] text-nowrap top-[-72px] whitespace-pre">
        <p className="mb-0">0</p>
        <p className="mb-0">1</p>
        <p className="mb-0">2</p>
        <p className="mb-0">3</p>
        <p className="mb-0">4</p>
        <p className="mb-0">5</p>
        <p className="mb-0">6</p>
        <p className="mb-0">7</p>
        <p className="mb-0">8</p>
        <p className="mb-0">9</p>
        <p>0</p>
      </div>
    </div>
  );
}

function Number25() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="Number">
      <Number24 />
    </div>
  );
}

function RollNumbers13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Roll numbers">
      <Number25 />
    </div>
  );
}

function Number26() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="Number">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[36px] not-italic relative shrink-0 text-[#1c1c1c] text-[24px] text-nowrap whitespace-pre">,</p>
    </div>
  );
}

function RollNumbers14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Roll numbers">
      <Number26 />
    </div>
  );
}

function Number27() {
  return (
    <div className="h-[36px] relative shrink-0 w-[16px]" data-name="Number">
      <div className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[36px] left-0 not-italic text-[#1c1c1c] text-[24px] text-nowrap top-[-108px] whitespace-pre">
        <p className="mb-0">0</p>
        <p className="mb-0">1</p>
        <p className="mb-0">2</p>
        <p className="mb-0">3</p>
        <p className="mb-0">4</p>
        <p className="mb-0">5</p>
        <p className="mb-0">6</p>
        <p className="mb-0">7</p>
        <p className="mb-0">8</p>
        <p className="mb-0">9</p>
        <p>0</p>
      </div>
    </div>
  );
}

function Number28() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="Number">
      <Number27 />
    </div>
  );
}

function RollNumbers15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Roll numbers">
      <Number28 />
    </div>
  );
}

function Number29() {
  return (
    <div className="h-[36px] relative shrink-0 w-[16px]" data-name="Number">
      <div className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[36px] left-0 not-italic text-[#1c1c1c] text-[24px] text-nowrap top-[-36px] whitespace-pre">
        <p className="mb-0">0</p>
        <p className="mb-0">1</p>
        <p className="mb-0">2</p>
        <p className="mb-0">3</p>
        <p className="mb-0">4</p>
        <p className="mb-0">5</p>
        <p className="mb-0">6</p>
        <p className="mb-0">7</p>
        <p className="mb-0">8</p>
        <p className="mb-0">9</p>
        <p>0</p>
      </div>
    </div>
  );
}

function Number30() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="Number">
      <Number29 />
    </div>
  );
}

function RollNumbers16() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Roll numbers">
      <Number30 />
    </div>
  );
}

function Number31() {
  return (
    <div className="h-[36px] relative shrink-0 w-[16px]" data-name="Number">
      <div className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[36px] left-0 not-italic text-[#1c1c1c] text-[24px] text-nowrap top-[-288px] whitespace-pre">
        <p className="mb-0">0</p>
        <p className="mb-0">1</p>
        <p className="mb-0">2</p>
        <p className="mb-0">3</p>
        <p className="mb-0">4</p>
        <p className="mb-0">5</p>
        <p className="mb-0">6</p>
        <p className="mb-0">7</p>
        <p className="mb-0">8</p>
        <p className="mb-0">9</p>
        <p>0</p>
      </div>
    </div>
  );
}

function Number32() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="Number">
      <Number31 />
    </div>
  );
}

function RollNumbers17() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Roll numbers">
      <Number32 />
    </div>
  );
}

function RollingNumber3() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Rolling number">
      <RollNumbers13 />
      <RollNumbers14 />
      <RollNumbers15 />
      <RollNumbers16 />
      <RollNumbers17 />
    </div>
  );
}

function Text43() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-black w-full">+6.08%</p>
    </div>
  );
}

function ArrowRise2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="ArrowRise">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="ArrowRise">
          <path clipRule="evenodd" d={svgPaths.pb846800} fill="var(--fill-0, black)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon46() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <ArrowRise2 />
    </div>
  );
}

function IconText15() {
  return (
    <div className="basis-0 content-center flex flex-wrap gap-[8px] grow items-center justify-end min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Icon & Text">
      <Text43 />
      <Icon46 />
    </div>
  );
}

function Content22() {
  return (
    <div className="content-center flex flex-wrap gap-[8px] items-center justify-between relative rounded-[8px] shrink-0 w-full" data-name="Content">
      <RollingNumber3 />
      <IconText15 />
    </div>
  );
}

function Card3() {
  return (
    <div className="basis-0 bg-[#7dbbff] grow min-h-px min-w-[200px] relative rounded-[20px] shrink-0" data-name="Card">
      <div className="min-w-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[8px] items-start min-w-[inherit] p-[24px] relative w-full">
          <Text42 />
          <Content22 />
        </div>
      </div>
    </div>
  );
}

function Block() {
  return (
    <div className="basis-0 bg-[#f9f9fa] grow h-[330px] min-h-px min-w-[662px] relative rounded-[20px] shrink-0" data-name="Block">
      <div className="min-w-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[16px] h-[330px] items-start min-w-[inherit] p-[24px] relative w-full">
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-[149px]">Your Profile Snapshot</p>
          <div className="h-[37px] relative shrink-0 w-[38px]" data-name="User_fill">
            <div className="absolute inset-[58.33%_13.78%_12.5%_13.78%]">
              <div className="absolute bottom-[7.55%] left-[1.3%] right-[1.3%] top-0">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 10">
                  <path d={svgPaths.p198cf00} fill="var(--fill-0, #222222)" id="Ellipse 45" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-[12.5%_29.17%_45.83%_29.17%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                <ellipse cx="7.91667" cy="7.70833" fill="var(--fill-0, #222222)" id="Ellipse 46" rx="7.91667" ry="7.70833" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Text44() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0 w-full" data-name="Text">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Traffic by Website</p>
    </div>
  );
}

function Text45() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal h-full items-start justify-between leading-[16px] not-italic px-0 py-[8px] relative rounded-[12px] shrink-0 text-[12px] text-black" data-name="Text">
      <p className="relative shrink-0 w-full">Google</p>
      <p className="relative shrink-0 w-full">YouTube</p>
      <p className="relative shrink-0 w-full">Instagram</p>
      <p className="relative shrink-0 w-full">Pinterest</p>
      <p className="relative shrink-0 w-full">Facebook</p>
      <p className="relative shrink-0 w-full">Twitter</p>
    </div>
  );
}

function HorizontalBar5() {
  return (
    <div className="basis-0 content-stretch flex gap-[2px] grow items-center min-h-px min-w-px px-0 py-[16px] relative shrink-0 w-full" data-name="HorizontalBar 03">
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-[rgba(0,0,0,0.4)] grow h-full max-h-[8px] min-h-px min-w-px rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-[rgba(0,0,0,0.1)] grow h-full max-h-[8px] min-h-px min-w-px rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px opacity-0 rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px opacity-0 rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px opacity-0 rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px opacity-0 rounded-[80px] shrink-0" data-name="Rectangle" />
    </div>
  );
}

function HorizontalBar() {
  return (
    <div className="basis-0 content-stretch flex gap-[2px] grow items-center min-h-px min-w-px px-0 py-[16px] relative shrink-0 w-full" data-name="HorizontalBar 03">
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-[rgba(0,0,0,0.4)] grow h-full max-h-[8px] min-h-px min-w-px rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-[rgba(0,0,0,0.1)] grow h-full max-h-[8px] min-h-px min-w-px rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px opacity-0 rounded-[80px] shrink-0" data-name="Rectangle" />
    </div>
  );
}

function HorizontalBar1() {
  return (
    <div className="basis-0 content-stretch flex gap-[2px] grow items-center min-h-px min-w-px px-0 py-[16px] relative shrink-0 w-full" data-name="HorizontalBar 03">
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-[rgba(0,0,0,0.4)] grow h-full max-h-[8px] min-h-px min-w-px rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-[rgba(0,0,0,0.1)] grow h-full max-h-[8px] min-h-px min-w-px rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px opacity-0 rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px opacity-0 rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px opacity-0 rounded-[80px] shrink-0" data-name="Rectangle" />
    </div>
  );
}

function HorizontalBar2() {
  return (
    <div className="basis-0 content-stretch flex gap-[2px] grow items-center min-h-px min-w-px px-0 py-[16px] relative shrink-0 w-full" data-name="HorizontalBar 03">
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-[rgba(0,0,0,0.4)] grow h-full max-h-[8px] min-h-px min-w-px rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-[rgba(0,0,0,0.1)] grow h-full max-h-[8px] min-h-px min-w-px rounded-[80px] shrink-0" data-name="Rectangle" />
    </div>
  );
}

function HorizontalBar3() {
  return (
    <div className="basis-0 content-stretch flex gap-[2px] grow items-center min-h-px min-w-px px-0 py-[16px] relative shrink-0 w-full" data-name="HorizontalBar 03">
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-[rgba(0,0,0,0.4)] grow h-full max-h-[8px] min-h-px min-w-px rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-[rgba(0,0,0,0.1)] grow h-full max-h-[8px] min-h-px min-w-px rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px opacity-0 rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px opacity-0 rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px opacity-0 rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px opacity-0 rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px opacity-0 rounded-[80px] shrink-0" data-name="Rectangle" />
    </div>
  );
}

function HorizontalBar4() {
  return (
    <div className="basis-0 content-stretch flex gap-[2px] grow items-center min-h-px min-w-px px-0 py-[16px] relative shrink-0 w-full" data-name="HorizontalBar 03">
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-[rgba(0,0,0,0.4)] grow h-full max-h-[8px] min-h-px min-w-px rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-[rgba(0,0,0,0.1)] grow h-full max-h-[8px] min-h-px min-w-px rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px opacity-0 rounded-[80px] shrink-0" data-name="Rectangle" />
      <div className="basis-0 bg-black grow h-full max-h-[8px] min-h-px min-w-px opacity-0 rounded-[80px] shrink-0" data-name="Rectangle" />
    </div>
  );
}

function Horizontal() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-full items-start relative shrink-0 w-[80px]" data-name="Horizontal 03">
      <HorizontalBar5 />
      <HorizontalBar />
      <HorizontalBar1 />
      <HorizontalBar2 />
      <HorizontalBar3 />
      <HorizontalBar4 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="basis-0 content-stretch flex gap-[16px] grow items-start min-h-px min-w-px relative shrink-0 w-full" data-name="Frame">
      <Text45 />
      <Horizontal />
    </div>
  );
}

function Block1() {
  return (
    <div className="basis-0 bg-[#f9f9fa] grow h-[330px] max-w-[272px] min-h-px min-w-[200px] relative rounded-[20px] shrink-0" data-name="Block">
      <div className="max-w-[inherit] min-w-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[16px] h-[330px] items-start max-w-[inherit] min-w-[inherit] p-[24px] relative w-full">
          <Text44 />
          <Frame6 />
        </div>
      </div>
    </div>
  );
}

function Text46() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0 w-full" data-name="Text">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Traffic by Device</p>
    </div>
  );
}

function LeftText() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal h-full items-end justify-between leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(0,0,0,0.4)] text-right" data-name="Left Text">
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0 w-full">
        <p className="leading-[16px]">30K</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0 w-full">
        <p className="leading-[16px]">20K</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0 w-full">
        <p className="leading-[16px]">10K</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0 w-full">
        <p className="leading-[16px]">0</p>
      </div>
    </div>
  );
}

function HorizontalLine() {
  return <div className="basis-0 grow min-h-px min-w-px shrink-0 w-full" data-name="Horizontal Line" />;
}

function Text47() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">2,000</p>
    </div>
  );
}

function Tooltip() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+0.75px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[52px] translate-x-[-50%]" data-name="Tooltip">
      <Text47 />
    </div>
  );
}

function Component() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-center justify-end min-h-px min-w-px relative shrink-0" data-name="1">
      <div className="basis-0 bg-[#a0bce8] grow max-w-[28px] min-h-px min-w-px opacity-0 rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#a0bce8] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#a0bce8] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#a0bce8] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#a0bce8] grow max-w-[28px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#a0bce8] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#a0bce8] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#a0bce8] grow max-w-[28px] min-h-px min-w-px rounded-bl-[8px] rounded-br-[8px] shrink-0 w-full" data-name="Rectangle" />
      <Tooltip />
    </div>
  );
}

function Text48() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">5,000</p>
    </div>
  );
}

function Tooltip1() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+0.75px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[-8px] translate-x-[-50%]" data-name="Tooltip">
      <Text48 />
    </div>
  );
}

function Component1() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-center justify-end min-h-px min-w-px relative shrink-0" data-name="2">
      <div className="basis-0 bg-[#6be6d3] grow max-w-[28px] min-h-px min-w-px opacity-0 rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#6be6d3] grow max-w-[28px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#6be6d3] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#6be6d3] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#6be6d3] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#6be6d3] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#6be6d3] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#6be6d3] grow max-w-[28px] min-h-px min-w-px rounded-bl-[8px] rounded-br-[8px] shrink-0 w-full" data-name="Rectangle" />
      <Tooltip1 />
    </div>
  );
}

function Text49() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">3,000</p>
    </div>
  );
}

function Tooltip2() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+0.75px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[32px] translate-x-[-50%]" data-name="Tooltip">
      <Text49 />
    </div>
  );
}

function Component2() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-center justify-end min-h-px min-w-px relative shrink-0" data-name="3">
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px opacity-0 rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px rounded-bl-[8px] rounded-br-[8px] shrink-0 w-full" data-name="Rectangle" />
      <Tooltip2 />
    </div>
  );
}

function Text50() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">6,000</p>
    </div>
  );
}

function Tooltip3() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+0.25px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[-28px] translate-x-[-50%]" data-name="Tooltip">
      <Text50 />
    </div>
  );
}

function Component3() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-center justify-end min-h-px min-w-px pb-0 pt-[16px] px-0 relative shrink-0" data-name="4">
      <div className="basis-0 bg-[#7dbbff] grow max-w-[28px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#7dbbff] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#7dbbff] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#7dbbff] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#7dbbff] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#7dbbff] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#7dbbff] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#7dbbff] grow max-w-[28px] min-h-px min-w-px rounded-bl-[8px] rounded-br-[8px] shrink-0 w-full" data-name="Rectangle" />
      <Tooltip3 />
    </div>
  );
}

function Text51() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">1,000</p>
    </div>
  );
}

function Tooltip4() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+0.75px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[72px] translate-x-[-50%]" data-name="Tooltip">
      <Text51 />
    </div>
  );
}

function Component4() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-center justify-end min-h-px min-w-px relative shrink-0" data-name="5">
      <div className="basis-0 bg-[#b899eb] grow max-w-[28px] min-h-px min-w-px opacity-0 rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#b899eb] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#b899eb] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#b899eb] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#b899eb] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#b899eb] grow max-w-[28px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#b899eb] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#b899eb] grow max-w-[28px] min-h-px min-w-px rounded-bl-[8px] rounded-br-[8px] shrink-0 w-full" data-name="Rectangle" />
      <Tooltip4 />
    </div>
  );
}

function Text52() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">4,000</p>
    </div>
  );
}

function Tooltip5() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+0.75px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[12px] translate-x-[-50%]" data-name="Tooltip">
      <Text52 />
    </div>
  );
}

function Component5() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-center justify-end min-h-px min-w-px relative shrink-0" data-name="6">
      <div className="basis-0 bg-[#71dd8c] grow max-w-[28px] min-h-px min-w-px opacity-0 rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#71dd8c] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#71dd8c] grow max-w-[28px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#71dd8c] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#71dd8c] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#71dd8c] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#71dd8c] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#71dd8c] grow max-w-[28px] min-h-px min-w-px rounded-bl-[8px] rounded-br-[8px] shrink-0 w-full" data-name="Rectangle" />
      <Tooltip5 />
    </div>
  );
}

function VerticalBar() {
  return (
    <div className="absolute content-stretch flex inset-0 items-end justify-between pb-[28px] pt-0 px-0" data-name="Vertical Bar">
      <Component />
      <Component1 />
      <Component2 />
      <Component3 />
      <Component4 />
      <Component5 />
    </div>
  );
}

function BottomText() {
  return (
    <div className="absolute bottom-0 content-stretch flex font-['Inter:Regular',sans-serif] font-normal items-center leading-[0] left-0 not-italic right-0 text-[12px] text-[rgba(0,0,0,0.4)] text-center" data-name="Bottom Text">
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0">
        <p className="leading-[16px]">Linux</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0">
        <p className="leading-[16px]">Mac</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0">
        <p className="leading-[16px]">iOS</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0">
        <p className="leading-[16px]">Windows</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0">
        <p className="leading-[16px]">Android</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0">
        <p className="leading-[16px]">Other</p>
      </div>
    </div>
  );
}

function Frame7() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-start min-h-px min-w-px relative shrink-0" data-name="Frame">
      <HorizontalLine />
      <VerticalBar />
      <BottomText />
    </div>
  );
}

function ChartMotion() {
  return (
    <div className="basis-0 content-stretch flex gap-[16px] grow items-start min-h-px min-w-px relative shrink-0 w-full" data-name="ChartMotion">
      <LeftText />
      <Frame7 />
    </div>
  );
}

function Block2() {
  return (
    <div className="basis-0 bg-[#f9f9fa] grow h-[280px] min-h-px min-w-[400px] relative rounded-[20px] shrink-0" data-name="Block">
      <div className="min-w-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[16px] h-[280px] items-start min-w-[inherit] p-[24px] relative w-full">
          <Text46 />
          <ChartMotion />
        </div>
      </div>
    </div>
  );
}

function Text53() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0 w-full" data-name="Text">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Traffic by Location</p>
    </div>
  );
}

function Text54() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">52.1%</p>
    </div>
  );
}

function Tooltip6() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+33.16px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[calc(50%+0.02px)] translate-x-[-50%] translate-y-[-50%]" data-name="Tooltip">
      <Text54 />
    </div>
  );
}

function DonutGraph() {
  return (
    <div className="absolute bottom-[0.03%] left-[38.07%] right-[0.01%] top-0" data-name="DonutGraph">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 75 120">
        <g id="Frame">
          <mask height="120" id="mask0_89_9965" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="75" x="0" y="0">
            <path clipRule="evenodd" d={svgPaths.p3a6cf100} fill="url(#paint0_linear_89_9965)" fillRule="evenodd" id="Subtract" />
          </mask>
          <g mask="url(#mask0_89_9965)">
            <g id="Subtract_2">
              <path clipRule="evenodd" d={svgPaths.p3a6cf100} fill="url(#paint1_linear_89_9965)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p3a6cf100} fill="var(--fill-1, black)" fillRule="evenodd" style={{ mixBlendMode: "screen" }} />
            </g>
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_89_9965" x1="74.3004" x2="33.6726" y1="0" y2="43.0674">
            <stop />
            <stop offset="1" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_89_9965" x1="37.1502" x2="37.1502" y1="0" y2="119.967">
            <stop />
            <stop offset="1" stopColor="#1C1C1C" stopOpacity="0.6" />
            <stop offset="1" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>
      <Tooltip6 />
    </div>
  );
}

function Text55() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">22.8%</p>
    </div>
  );
}

function Tooltip7() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+12.08px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[calc(50%+0.41px)] translate-x-[-50%] translate-y-[-50%]" data-name="Tooltip">
      <Text55 />
    </div>
  );
}

function DonutGraph1() {
  return (
    <div className="absolute inset-[37.5%_56.93%_1.51%_0.13%]" data-name="DonutGraph">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 52 74">
        <g id="Frame">
          <mask height="73" id="mask0_89_9925" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="51" x="0" y="0">
            <path clipRule="evenodd" d={svgPaths.p3d6f9400} fill="url(#paint0_linear_89_9925)" fillRule="evenodd" id="Subtract" />
          </mask>
          <g mask="url(#mask0_89_9925)">
            <path clipRule="evenodd" d={svgPaths.p3d6f9400} fill="var(--fill-0, #92BFFF)" fillRule="evenodd" id="Subtract_2" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_89_9925" x1="51.5327" x2="27.1317" y1="0" y2="29.4076">
            <stop />
            <stop offset="1" />
          </linearGradient>
        </defs>
      </svg>
      <Tooltip7 />
    </div>
  );
}

function Text56() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">13.9%</p>
    </div>
  );
}

function Tooltip8() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+12.98px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[calc(50%-0.15px)] translate-x-[-50%] translate-y-[-50%]" data-name="Tooltip">
      <Text56 />
    </div>
  );
}

function DonutGraph2() {
  return (
    <div className="absolute inset-[6.67%_62.37%_58.08%_2.41%]" data-name="DonutGraph">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 43 43">
        <g id="Frame">
          <mask height="41" id="mask0_89_9973" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="40" x="1" y="1">
            <path clipRule="evenodd" d={svgPaths.p38b2cf00} fill="url(#paint0_linear_89_9973)" fillRule="evenodd" id="Subtract" />
          </mask>
          <g mask="url(#mask0_89_9973)">
            <path clipRule="evenodd" d={svgPaths.p38b2cf00} fill="var(--fill-0, #94E9B8)" fillRule="evenodd" id="Subtract_2" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_89_9973" x1="42.268" x2="29.762" y1="0" y2="21.3879">
            <stop />
            <stop offset="1" />
          </linearGradient>
        </defs>
      </svg>
      <Tooltip8 />
    </div>
  );
}

function Text57() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">11.2%</p>
    </div>
  );
}

function Tooltip9() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+16.84px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[calc(50%+0.42px)] translate-x-[-50%] translate-y-[-50%]" data-name="Tooltip">
      <Text57 />
    </div>
  );
}

function DonutGraph3() {
  return (
    <div className="absolute bottom-[72.36%] left-[26.2%] right-[50.09%] top-0" data-name="DonutGraph">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29 34">
        <g id="Frame">
          <mask height="32" id="mask0_89_9937" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="28" x="1" y="0">
            <path clipRule="evenodd" d={svgPaths.p379c5880} fill="url(#paint0_linear_89_9937)" fillRule="evenodd" id="Subtract" />
          </mask>
          <g mask="url(#mask0_89_9937)">
            <path clipRule="evenodd" d={svgPaths.p379c5880} fill="var(--fill-0, #AEC7ED)" fillRule="evenodd" id="Subtract_2" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_89_9937" x1="28.4489" x2="17.9783" y1="0" y2="15.3713">
            <stop />
            <stop offset="1" />
          </linearGradient>
        </defs>
      </svg>
      <Tooltip9 />
    </div>
  );
}

function DonutChart() {
  return (
    <div className="relative shrink-0 size-[120px]" data-name="DonutChart">
      <DonutGraph />
      <DonutGraph1 />
      <DonutGraph2 />
      <DonutGraph3 />
    </div>
  );
}

function Dot() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Dot">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Dot">
          <path d={svgPaths.p10453ef0} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Tag() {
  return (
    <div className="content-stretch flex items-center pl-[4px] pr-[8px] py-[2px] relative rounded-[8px] shrink-0" data-name="Tag">
      <Dot />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-black text-nowrap whitespace-pre">United States</p>
    </div>
  );
}

function Text58() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-black w-full">52.1%</p>
    </div>
  );
}

function Content23() {
  return (
    <div className="content-center flex flex-wrap gap-[48px] items-center justify-between relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <Tag />
      <Text58 />
    </div>
  );
}

function Dot1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Dot">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Dot">
          <path d={svgPaths.p10453ef0} fill="var(--fill-0, #7DBBFF)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Tag1() {
  return (
    <div className="content-stretch flex items-center pl-[4px] pr-[8px] py-[2px] relative rounded-[8px] shrink-0" data-name="Tag">
      <Dot1 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-black text-nowrap whitespace-pre">Canada</p>
    </div>
  );
}

function Text59() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-black w-full">22.8%</p>
    </div>
  );
}

function Content24() {
  return (
    <div className="content-center flex flex-wrap gap-[48px] items-center justify-between relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <Tag1 />
      <Text59 />
    </div>
  );
}

function Dot4() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Dot">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Dot">
          <path d={svgPaths.p10453ef0} fill="var(--fill-0, #71DD8C)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Tag2() {
  return (
    <div className="content-stretch flex items-center pl-[4px] pr-[8px] py-[2px] relative rounded-[8px] shrink-0" data-name="Tag">
      <Dot4 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-black text-nowrap whitespace-pre">Mexico</p>
    </div>
  );
}

function Text60() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-black w-full">13.9%</p>
    </div>
  );
}

function Content25() {
  return (
    <div className="content-center flex flex-wrap gap-[48px] items-center justify-between relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <Tag2 />
      <Text60 />
    </div>
  );
}

function Dot5() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Dot">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Dot">
          <path d={svgPaths.p10453ef0} fill="var(--fill-0, #A0BCE8)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Tag3() {
  return (
    <div className="content-stretch flex items-center pl-[4px] pr-[8px] py-[2px] relative rounded-[8px] shrink-0" data-name="Tag">
      <Dot5 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-black text-nowrap whitespace-pre">Other</p>
    </div>
  );
}

function Text61() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-black w-full">11.2%</p>
    </div>
  );
}

function Content26() {
  return (
    <div className="content-center flex flex-wrap gap-[48px] items-center justify-between relative rounded-[12px] shrink-0 w-full" data-name="Content">
      <Tag3 />
      <Text61 />
    </div>
  );
}

function Card4() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[12px] grow items-start min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Card">
      <Content23 />
      <Content24 />
      <Content25 />
      <Content26 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="Frame">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[40px] items-center px-[20px] py-0 relative size-full">
          <DonutChart />
          <Card4 />
        </div>
      </div>
    </div>
  );
}

function Block3() {
  return (
    <div className="basis-0 bg-[#f9f9fa] grow h-[280px] min-h-px min-w-[400px] relative rounded-[20px] shrink-0" data-name="Block">
      <div className="min-w-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[16px] h-[280px] items-start min-w-[inherit] p-[24px] relative w-full">
          <Text53 />
          <Frame8 />
        </div>
      </div>
    </div>
  );
}

function Text62() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0 w-full" data-name="Text">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">{`Marketing & SEO`}</p>
    </div>
  );
}

function LeftText1() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal h-full items-end justify-between leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(0,0,0,0.4)] text-right" data-name="Left Text">
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0 w-full">
        <p className="leading-[16px]">30K</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0 w-full">
        <p className="leading-[16px]">20K</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0 w-full">
        <p className="leading-[16px]">10K</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0 w-full">
        <p className="leading-[16px]">0</p>
      </div>
    </div>
  );
}

function HorizontalLine1() {
  return <div className="basis-0 grow min-h-px min-w-px shrink-0 w-full" data-name="Horizontal Line" />;
}

function Text63() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">2,000</p>
    </div>
  );
}

function Tooltip10() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+0.96px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[52px] translate-x-[-50%]" data-name="Tooltip">
      <Text63 />
    </div>
  );
}

function Component12() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-center justify-end min-h-px min-w-px relative shrink-0" data-name="1">
      <div className="basis-0 bg-[#9f9ff8] grow max-w-[28px] min-h-px min-w-px opacity-0 rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#9f9ff8] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#9f9ff8] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#9f9ff8] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#9f9ff8] grow max-w-[28px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#9f9ff8] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#9f9ff8] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#9f9ff8] grow max-w-[28px] min-h-px min-w-px rounded-bl-[8px] rounded-br-[8px] shrink-0 w-full" data-name="Rectangle" />
      <Tooltip10 />
    </div>
  );
}

function Text64() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">5,000</p>
    </div>
  );
}

function Tooltip11() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+0.96px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[-8px] translate-x-[-50%]" data-name="Tooltip">
      <Text64 />
    </div>
  );
}

function Component13() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-center justify-end min-h-px min-w-px relative shrink-0" data-name="2">
      <div className="basis-0 bg-[#96e2d6] grow max-w-[28px] min-h-px min-w-px opacity-0 rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#96e2d6] grow max-w-[28px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#96e2d6] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#96e2d6] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#96e2d6] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#96e2d6] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#96e2d6] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#96e2d6] grow max-w-[28px] min-h-px min-w-px rounded-bl-[8px] rounded-br-[8px] shrink-0 w-full" data-name="Rectangle" />
      <Tooltip11 />
    </div>
  );
}

function Text65() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">3,000</p>
    </div>
  );
}

function Tooltip12() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+0.96px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[32px] translate-x-[-50%]" data-name="Tooltip">
      <Text65 />
    </div>
  );
}

function Component14() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-center justify-end min-h-px min-w-px relative shrink-0" data-name="3">
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px opacity-0 rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px rounded-bl-[8px] rounded-br-[8px] shrink-0 w-full" data-name="Rectangle" />
      <Tooltip12 />
    </div>
  );
}

function Text66() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">6,000</p>
    </div>
  );
}

function Tooltip13() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+0.46px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[-28px] translate-x-[-50%]" data-name="Tooltip">
      <Text66 />
    </div>
  );
}

function Component15() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-center justify-end min-h-px min-w-px pb-0 pt-[16px] px-0 relative shrink-0" data-name="4">
      <div className="basis-0 bg-[#92bfff] grow max-w-[28px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#92bfff] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#92bfff] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#92bfff] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#92bfff] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#92bfff] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#92bfff] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#92bfff] grow max-w-[28px] min-h-px min-w-px rounded-bl-[8px] rounded-br-[8px] shrink-0 w-full" data-name="Rectangle" />
      <Tooltip13 />
    </div>
  );
}

function Text67() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">1,000</p>
    </div>
  );
}

function Tooltip14() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+0.96px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[72px] translate-x-[-50%]" data-name="Tooltip">
      <Text67 />
    </div>
  );
}

function Component16() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-center justify-end min-h-px min-w-px relative shrink-0" data-name="5">
      <div className="basis-0 bg-[#aec7ed] grow max-w-[28px] min-h-px min-w-px opacity-0 rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#aec7ed] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#aec7ed] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#aec7ed] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#aec7ed] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#aec7ed] grow max-w-[28px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#aec7ed] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#aec7ed] grow max-w-[28px] min-h-px min-w-px rounded-bl-[8px] rounded-br-[8px] shrink-0 w-full" data-name="Rectangle" />
      <Tooltip14 />
    </div>
  );
}

function Text68() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">4,000</p>
    </div>
  );
}

function Tooltip15() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+0.96px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[12px] translate-x-[-50%]" data-name="Tooltip">
      <Text68 />
    </div>
  );
}

function Component17() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-center justify-end min-h-px min-w-px relative shrink-0" data-name="6">
      <div className="basis-0 bg-[#94e9b8] grow max-w-[28px] min-h-px min-w-px opacity-0 rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#94e9b8] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#94e9b8] grow max-w-[28px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#94e9b8] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#94e9b8] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#94e9b8] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#94e9b8] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#94e9b8] grow max-w-[28px] min-h-px min-w-px rounded-bl-[8px] rounded-br-[8px] shrink-0 w-full" data-name="Rectangle" />
      <Tooltip15 />
    </div>
  );
}

function Text69() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">2,000</p>
    </div>
  );
}

function Tooltip16() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+0.96px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[52px] translate-x-[-50%]" data-name="Tooltip">
      <Text69 />
    </div>
  );
}

function Component6() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-center justify-end min-h-px min-w-px relative shrink-0" data-name="7">
      <div className="basis-0 bg-[#9f9ff8] grow max-w-[28px] min-h-px min-w-px opacity-0 rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#9f9ff8] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#9f9ff8] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#9f9ff8] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#9f9ff8] grow max-w-[28px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#9f9ff8] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#9f9ff8] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#9f9ff8] grow max-w-[28px] min-h-px min-w-px rounded-bl-[8px] rounded-br-[8px] shrink-0 w-full" data-name="Rectangle" />
      <Tooltip16 />
    </div>
  );
}

function Text70() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">5,000</p>
    </div>
  );
}

function Tooltip17() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+0.96px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[-8px] translate-x-[-50%]" data-name="Tooltip">
      <Text70 />
    </div>
  );
}

function Component7() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-center justify-end min-h-px min-w-px relative shrink-0" data-name="8">
      <div className="basis-0 bg-[#96e2d6] grow max-w-[28px] min-h-px min-w-px opacity-0 rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#96e2d6] grow max-w-[28px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#96e2d6] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#96e2d6] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#96e2d6] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#96e2d6] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#96e2d6] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#96e2d6] grow max-w-[28px] min-h-px min-w-px rounded-bl-[8px] rounded-br-[8px] shrink-0 w-full" data-name="Rectangle" />
      <Tooltip17 />
    </div>
  );
}

function Text71() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">3,000</p>
    </div>
  );
}

function Tooltip18() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+0.96px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[32px] translate-x-[-50%]" data-name="Tooltip">
      <Text71 />
    </div>
  );
}

function Component8() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-center justify-end min-h-px min-w-px relative shrink-0" data-name="9">
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px opacity-0 rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-black grow max-w-[28px] min-h-px min-w-px rounded-bl-[8px] rounded-br-[8px] shrink-0 w-full" data-name="Rectangle" />
      <Tooltip18 />
    </div>
  );
}

function Text72() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">6,000</p>
    </div>
  );
}

function Tooltip19() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+0.46px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[-28px] translate-x-[-50%]" data-name="Tooltip">
      <Text72 />
    </div>
  );
}

function Component9() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-center justify-end min-h-px min-w-px relative shrink-0" data-name="10">
      <div className="basis-0 bg-[#92bfff] grow max-w-[28px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#92bfff] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#92bfff] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#92bfff] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#92bfff] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#92bfff] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#92bfff] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#92bfff] grow max-w-[28px] min-h-px min-w-px rounded-bl-[8px] rounded-br-[8px] shrink-0 w-full" data-name="Rectangle" />
      <Tooltip19 />
    </div>
  );
}

function Text73() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">1,000</p>
    </div>
  );
}

function Tooltip20() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+0.96px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[72px] translate-x-[-50%]" data-name="Tooltip">
      <Text73 />
    </div>
  );
}

function Component10() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-center justify-end min-h-px min-w-px relative shrink-0" data-name="11">
      <div className="basis-0 bg-[#aec7ed] grow max-w-[28px] min-h-px min-w-px opacity-0 rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#aec7ed] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#aec7ed] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#aec7ed] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#aec7ed] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#aec7ed] grow max-w-[28px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#aec7ed] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#aec7ed] grow max-w-[28px] min-h-px min-w-px rounded-bl-[8px] rounded-br-[8px] shrink-0 w-full" data-name="Rectangle" />
      <Tooltip20 />
    </div>
  );
}

function Text74() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[8px] shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-white w-full">4,000</p>
    </div>
  );
}

function Tooltip21() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.8)] content-stretch flex items-center left-[calc(50%+0.96px)] opacity-0 px-[8px] py-[4px] rounded-[8px] top-[12px] translate-x-[-50%]" data-name="Tooltip">
      <Text74 />
    </div>
  );
}

function Component11() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-center justify-end min-h-px min-w-px relative shrink-0" data-name="12">
      <div className="basis-0 bg-[#94e9b8] grow max-w-[28px] min-h-px min-w-px opacity-0 rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#94e9b8] grow max-w-[28px] min-h-px min-w-px opacity-0 shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#94e9b8] grow max-w-[28px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#94e9b8] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#94e9b8] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#94e9b8] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#94e9b8] grow max-w-[28px] min-h-px min-w-px shrink-0 w-full" data-name="Rectangle" />
      <div className="basis-0 bg-[#94e9b8] grow max-w-[28px] min-h-px min-w-px rounded-bl-[8px] rounded-br-[8px] shrink-0 w-full" data-name="Rectangle" />
      <Tooltip21 />
    </div>
  );
}

function VerticalBar1() {
  return (
    <div className="absolute content-stretch flex inset-0 items-end justify-between pb-[28px] pt-0 px-0" data-name="Vertical Bar">
      <Component12 />
      <Component13 />
      <Component14 />
      <Component15 />
      <Component16 />
      <Component17 />
      <Component6 />
      <Component7 />
      <Component8 />
      <Component9 />
      <Component10 />
      <Component11 />
    </div>
  );
}

function BottomText1() {
  return (
    <div className="absolute bottom-0 content-stretch flex font-['Inter:Regular',sans-serif] font-normal items-center leading-[0] left-0 not-italic right-0 text-[12px] text-[rgba(0,0,0,0.4)] text-center" data-name="Bottom Text">
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0">
        <p className="leading-[16px]">Jan</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0">
        <p className="leading-[16px]">Feb</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0">
        <p className="leading-[16px]">Mar</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0">
        <p className="leading-[16px]">Apr</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0">
        <p className="leading-[16px]">May</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0">
        <p className="leading-[16px]">Jun</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0">
        <p className="leading-[16px]">Jul</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0">
        <p className="leading-[16px]">Aug</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0">
        <p className="leading-[16px]">Sep</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0">
        <p className="leading-[16px]">Oct</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0">
        <p className="leading-[16px]">Nov</p>
      </div>
      <div className="basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0">
        <p className="leading-[16px]">Dec</p>
      </div>
    </div>
  );
}

function Frame9() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-start min-h-px min-w-px relative shrink-0" data-name="Frame">
      <HorizontalLine1 />
      <VerticalBar1 />
      <BottomText1 />
    </div>
  );
}

function ChartMotion1() {
  return (
    <div className="basis-0 content-stretch flex gap-[16px] grow items-start min-h-px min-w-px relative shrink-0 w-full" data-name="ChartMotion">
      <LeftText1 />
      <Frame9 />
    </div>
  );
}

function Block4() {
  return (
    <div className="basis-0 bg-[#f9f9fa] grow h-[280px] min-h-px min-w-[800px] relative rounded-[20px] shrink-0" data-name="Block">
      <div className="min-w-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[16px] h-[280px] items-start min-w-[inherit] p-[24px] relative w-full">
          <Text62 />
          <ChartMotion1 />
        </div>
      </div>
    </div>
  );
}

function Frame10() {
  return (
    <div className="absolute content-start flex flex-wrap gap-[28px] items-start left-[240px] top-[140px] w-[892px]" data-name="Frame">
      <Card />
      <Card1 />
      <Card2 />
      <Card3 />
      <Block />
      <Block1 />
      <Block2 />
      <Block3 />
      <Block4 />
    </div>
  );
}

function Text75() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[12px] shrink-0" data-name="Text">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-black text-center w-full">
        <p className="leading-[16px]">Today</p>
      </div>
    </div>
  );
}

function ArrowLineDown() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="ArrowLineDown2">
      <div className="absolute bottom-[-31.25%] left-0 right-[-56.25%] top-0">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 21">
          <g id="ArrowLineDown2">
            <path clipRule="evenodd" d={svgPaths.p2725f100} fill="var(--fill-0, black)" fillOpacity="0.4" fillRule="evenodd" id="Vector" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Icon47() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <ArrowLineDown />
    </div>
  );
}

function Button8() {
  return (
    <div className="absolute content-stretch flex gap-[4px] items-center justify-center px-[8px] py-[4px] right-[308px] rounded-[8px] top-[96px]" data-name="Button">
      <Text75 />
      <Icon47 />
    </div>
  );
}

function Text76() {
  return (
    <div className="absolute content-stretch flex flex-col items-start justify-center left-[240px] px-[8px] py-[4px] rounded-[12px] top-[96px]" data-name="Text">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full">Overview</p>
    </div>
  );
}

export default function ApplicantView() {
  return (
    <div className="bg-white overflow-clip relative rounded-[24px] size-full" data-name="Applicant View">
      <Sidebar />
      <Content9 />
      <RightBar />
      <Header />
      <Frame10 />
      <Button8 />
      <Text76 />
      <div className="absolute left-[53px] size-[100px] top-[894px]" data-name="CMe Logo 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgCMeLogo1} />
      </div>
    </div>
  );
}