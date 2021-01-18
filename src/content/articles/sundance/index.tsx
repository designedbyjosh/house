import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const Content: React.FC = () => {

  let active = useSelector((state: any) => state.networking.status);

  return (
    <>
      <h2>Hey there!</h2>
      <p>Let's make sure we're all connected.</p>
    </>
  )

}

const metadata = {
  id: "sundance",
  category: {name: "Projects", icon: "fas fa-coffee"},
  title: "Sundance",
  focusIndex: 120,
  showMetadata: false,
  backgroundColor: "#a6483a",
  color: "black",
  published: Date.parse("2020-10-30T12:00:00Z")
} as ArticleMetadata

export default { metadata, content: Content } as Article