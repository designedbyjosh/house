import React from 'react';

const content: React.FC = () => {

  return (
    <>
      <h2>This is a header</h2>
      <p>You can write whatever you want and do whatever you want in here. The world is our oyster! Power to us!</p>
    </>
  )

}

const metadata = {
  id: "sample-post",
  category: "Something",
  title: "This is a sample post",
  focusIndex: 120,
  backgroundColor: "#959684",
  image: {URL: new URL("https://content.fortune.com/wp-content/uploads/2015/06/gettyimages-470851485.jpg"), author: "Ethan Miller (Getty Images)", alt: "Shangai Solar Farm by Oakland"},
  published: Date.parse("2020-10-30T12:00:00Z")
} as ArticleMetadata

export default { metadata, content } as Article