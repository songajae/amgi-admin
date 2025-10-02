// ==============================
// File: src/components/common/TruncateText.jsx
// Role: 재사용 텍스트 트렁케이트(… 처리) 컴포넌트
// ==============================

import React from "react";

/**
 * TruncateText
 * - 텍스트를 maxChars 기준으로 한 줄로 자르고 ... 처리
 * - 전체 텍스트는 title 툴팁으로 표시
 * - href가 있으면 <a>로 렌더링, 없으면 <span>
 */
export default function TruncateText({
  text = "",
  maxChars = 60,           // 기본값 60ch 로 변경
  className = "",
  href,
  newTab = true,
  title = undefined,
  style = {},
  ...rest
}) {
  const commonProps = {
    title: title ?? text,
    className: `block truncate ${className}`,
    style: { maxWidth: `${maxChars}ch`, ...style },
    ...rest,
  };

  if (href) {
    return (
      <a
        href={href}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        {...commonProps}
      >
        {text}
      </a>
    );
  }

  return <span {...commonProps}>{text}</span>;
}
