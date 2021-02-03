---
 id: migrating-to-next
 title: Loving life and Migrating from React Boilerplate to NextJS
 focusIndex: 0
 color: 2cb2ff
 category: code
 type: article
 backgroundColor: dark-gray
 published: "2021-01-30T12:00:00Z"
 coverImage: https://josh-house.s3-ap-southeast-2.amazonaws.com/migrating-to-next/background.jpeg
 description: This blog was initially created using Create React App which required developing my own routing protocols and including a heap of packages that provided support for SEO, which in the end, didn't work particularly well anyway. I found that migrating to NextJS allowed me to retain my components and layout I was already using while also exposing my application to easier deployment tools and better SEO.
---

React provides a great framework for developing responsive web applications. The downside is, React websites are single page applications that rely on extensive logic being run on the client side. When stuff is run on the client side, we start to encounter a few compromises that may or may not be a problem, depending on use cases.

- SEO is a mixed bag since some crawlers will refuse to render your application, since it takes too long.
- Clever engineers can work out application logic for restricted paths, which can expose security vulnerabilities in business logic.

NextJS was something I knew about but, being a bit of a React purist, I dismissed on the premise that to demonstrate my skills and abilities in web development, I *must* be developing **everything** on my own. In reality, I've now discovered that this is a pretty stripped down view on web development. In reality, the best way to use your tools and how experienced you are with them is a testament to the ability of a good engineer.

So, let's go through - using the three points above on why client side applications may not always the best idea - the reasons I loved migrating to NextJS and the considerations you should make when considering making that switch for your next web project.

## SEO

<img src="https://josh-house.s3-ap-southeast-2.amazonaws.com/migrating-to-next/notveryhigh.png" width="100%">

Search Engine Optimisation (SEO) is how you climb the ladder of attention for your target users. Poor SEO equates to fewer users visiting your website. SEO relies on search engine crawlers successfully navigating your website and categorising and viewing its' contents. When a web crawler fails to parse your website, it'll be dismissed and drop in ranking. And yes, this website doesn't even appear in search at the moment (15 minutes after updating to NextJS), so in a way, that speaks for itself. There's a heap of other factors that affect SEO as well, such as how populated the search term you're targeting is (in my case, Josh's House tends to nick most of the traffic) or how useful your content *appears* to be.

SEO is improved using NextJS since it is both rendered server side or during build time, which means that there isn't a delay in painting to the DOM, something that crawlers will quickly ignore you for; in addition to handling meta tags more easily using built in helmet writing components (without it, you'd likely be using React-Helmet).

## Fighting back those engineers

How secure your application should always rank highly on your list of priorities when developing for the open web. When serving a client-side rendered application, files are compiled and then served using a reverse proxy or file server. These files are transmitted, in full, over your nominated transport mechanism (please be HTTPS) which is then processed and rendered by the client. These files, since they're transmitted in full, can contain the logic of your business by exposing how you handle certain responses and how data flows into and out of your server and your client. If there's certain aspects you'd like to hide, server side rendering facilitates this by only providing to the client what they should see and nothing more. 

An example of client side rendering would be a popular Australian hardware store who handles all of their requests client side. It's possible to work out unique keys and the way that key interacts with the server by delving into the Redux store (global state) of the React application.

<img src="https://josh-house.s3-ap-southeast-2.amazonaws.com/migrating-to-next/hardwarestore_redux.png" width="100%">

Although this isn't a major security threat in and of itself, it's a consideration that, well, what if we started trying different **storeKeys** to see if we can get a different response back, that starts the conversation on what your risk tolerance is with your application and how closely you guard your business logic.

NextJS facilitates improved security by concealing your business logic to it's minimal requirements, when using server side rendering requests are transmitted to the server and calls are made out to wherever they need to go, before being rendered into a new website and returned to the user. No more public endpoints that can be hit by anyone for any reason and no more client processing of these responses that can be reverse engineered to expose how your private APIs behave.

## Other benefits

- Module level CSS/SCSS which reduces collisions in larger projects
- Easier management of routes and automatic generation of smaller assets for faster load times
- Easier support for ```head``` and ```meta``` tags
- Easily swappable backends using the built in ```getStaticProps``` functions to help accelerate load times for users by preloading content that is static

## So what do I do?

Migrating to NextJS provided a great chance to try out a new framework and apply it to a small project. The conversion was painless and allowed me to reuse most of my code (although there's still some refactoring needing to be done). If you're intereseted in providing a secure and positive user experience for all your targeted users that may be reaching your site through search, I recommended checking it out.


