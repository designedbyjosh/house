---
 id: reflectance
 title: Cameras, mirrors and soiling? A year of reflection
 focusIndex: 240
 color: 2cb2ff
 type: article
 category: books
 backgroundColor: dark-gray
 published: "2020-10-30T12:00:00Z"
 coverImage: https://josh-house.s3-ap-southeast-2.amazonaws.com/reflectance/solar.jpg
 description: I researched a way to estimate reflectance of mirrors for large solar farms using long range cameras and existing reflectance estimation algorithms. Turns out, these algorithms are damn good at handling degraded pixel resolution. Data indicates that pixel resolution ranges down to 100PPM are still viable estimators to manual measurement of reflectance of a mirror.
---

## enter stage left: develop raport

Over the past 12 months I've been conducting research here in Australia in the field of renewable energy as part of my Bachelors in Mechatronics Engineering. At least that's what I told myself coming into the project. As part of becoming an engineer, it's required that you complete a substantial research project which, here in Australia, is called your **honours** year. The objective being to develop skills in research and to have the privilege of contributing to your field of choice. Yes, I worked across two completely different fields because, as they say, [breadth is more important than depth](https://medium.com/@christos.a.makridis/why-breadth-is-important-for-depth-54ddc5317ff9). I believed, going into this project, I'd get more out of something entirely different that really pushed the boundaries on what I've worked on prior. In all seriousness though, I thought that if there was going to be an opportunity to help save the planet, at least even by a little bit, it was obviously in doing research with cameras, giant mirrors and cool <span classname="sidenote">(reflectometers shoot lasers btw)</span> gear.

<img src="https://josh-house.s3-ap-southeast-2.amazonaws.com/reflectance/extra_cool_machine.png" width="100%">

This, however, is all peripheral to what it really takes to become an engineer which includes: fixing at least 25 routers, reminding at least 50 people that you aren't an IT specialist and then convincing a further 100 people that there's more to mechatronics than just robots. You also learn that you can't work out how to fix a broken electric couch, even though it's a mechatronics system. But you can try using duct tape and faith. And as it turns out, there's a lot more in this world [running on duct tape](https://www.booktopia.com.au/duct-tape-engineer-lance-akiyama/book/9781631591303.html) than I first thought.

## enter stage right: actual content

So, the whole purpose of this year is to focus on one big overarching inquiry, called a **research question**, and then spending the whole year working towards answering that single question. As well as navigating the panic, fear and 2-day-prior rewrites that you all went through when you did a research project as well, _right?_

In my case, my research question was a collaborative effort with my supervisors which stemmed from some existing research into their method of using a stochastic multimodal soiling model to estimate the reflectance of a mirror. Let's rewind a little before we continue on though, and look at some pretty pictures to explain this better.

<img src="https://josh-house.s3-ap-southeast-2.amazonaws.com/reflectance/receiver.jpg" width="100%">

In concentrated solar farms, like in above, mirrors focus light onto a central receiver which: (1) heats up a fluid; which, (2) produces steam; then, (3) spins a turbine; and lastly, (4) makes power.

It's a pretty phenomenal process to generate power, and it works swimmingly. The problem, however, is that dirty mirrors reduce the amount of energy hitting that central receiver. Dirt can be bird droppings, dust or a damn fine roast lunch cooking on a mirror <span classname="sidenote">(well, maybe not quite enough to cook a roast lunch but see the image below anyway)</span>. My research was designed to extend upon existing research to identify whether instead of using drones to take close up pictures of a mirror to estimate reflectance, we could use one massive camera <span classname="sidenote">(or a few smaller ones around the plant)</span> to do it all for us. In other words, remove any need for a human to interact with this whole system, beyond the actual cleaning process. At the moment, this process can actually be really manual using a handheld reflectometer like in the first image, through to a bit more autonomous with drones and finally, my proposed solution, fixed cameras with no human interaction; or at the very least improving the amount of pictures per drone flight, anyway.

<img src="https://josh-house.s3-ap-southeast-2.amazonaws.com/reflectance/roast.jpg" width="100%">

## but, how?

So, in early 2020, I set off with my giant mirrors, my camera and started testing the robustness of the estimation algorithm. <span classname="sidenote">Plot twist, the algorithm was in development simultaneously to my research which introduced challenges but let's ignore those for now</span>. Over the following year, I quickly discovered that there is so much more to taking pictures than opening the Camera app and clicking that big white circle. You also have to take off the lens cap.

The project involved two stages in evaluating the robustness of the estimation algorithm to pixel resolution degradation in tandem with the effect of changing capture parameters. In English, what I'm saying is, let's say you move further and further away from your subject, how well does the estimation algorithm handle that extra distance (and less pixels per subject). The stages were **the Acquisition Phase**, where I physically took photos for my study, followed by **the Processing Phase**, where the images were processed and I made conclusions. Over 1000 images were taken over 11 different days with the total size of the dataset reaching almost 1TB in imagery.

Images were captured using a Canon EOS 550D from 2010 with an 18 megapixel (MP) effective resolution (18.7MP total). The camera type was a TTL-CT-SIR AF-dedicated with a CMOS sensor. I used a tripod to stabilise the camera, particularly when using low shutter-speeds, and three separate lenses were used for several different datasets.

<img src="https://josh-house.s3-ap-southeast-2.amazonaws.com/reflectance/epic_custom_rig.png" width="100%">

Images were captured in ranges from 1m up to 70m across several days throughout the year. Due to dependence of the estimation algorithm on the heliostat mirror being directed at a clear blue sky, the days in which images could be captured were limited to clear conditions with daylight. Heliostat mirrors must be carefully directed, as certain angles can result in sunlight flaring <span classname="sidenote">(which is when streaks become white at certain angles)</span> and possibly result in incorrectly classified soiling components.

The timing of the image capture varied from early morning to late afternoon to assist in the reduction of sunlight flaring on the heliostat mirrors. The mirror direction and angle relative to the camera was carefully selected as several early datasets were rendered useless as a result of flaring from cleaning streaks. To assist in the heliostat mirror positioning, the mirrors were placed at several angles using an improvised rig consisting of a step ladder and adhesive padding <span classname="sidenote">(also known as duct tape and faith)</span> to secure the mirrors in heavy winds.

## well, the verdict?

The estimation algorithm is actually really robust to increased distance. Now, by increased distance, yes there's the option of zooming in from far away, but what we're examining here is pixel density measured in PPM <span classname="sidenote">(pixels per metre)</span>. The lower the PPM value, the lower the resolution and theoretically, the smaller the size of the file. What I found is intuitive at first glance. I mean, of course, estimation is less reliable at lower resolutions. Less information equates to more unsurity and greater proximity to the noise floor (random jibberish underlying everything). What's interesting, however, is that the estimation algorithm is actually **way more** robust to reduced pixel resolution.

This far exceeds our expectations and represents an important shift in perspective on how we can apply the reflectance estimation algorithm. Currently, single images are taken of a mirror by a drone floating above it. But, now we realise we could perhaps have a drone fly way up in the sky and capture images with far more mirrors in a single image, pull them out using a contour detector and automagically estimate reflectance for entire fields in one go! <span classname="sidenote">Well, probably not entire fields but significantly more than we could before, anyway.</span>

Let's not finish up there though. So, in the above data we found that in simulated imaging conditions, that is, using bilinear interpolation to shrink images down intentionally we're actually getting really solid performance. But with less data, naturally, we're getting far better performance as wel in creating those estimations. Less data to process is a win-win for everybody right? Well, this is particularly the case when the estimation algorithm still produces reliable results. Once the original research is available I'll put a graph here and explain why it looks the way it does, but in the meantime, please take my word for it.

## so, what did I learn?

I learned that research is extraordinarily difficult and I have immense respect for the researchers of the world. It's a completely different life traversing the unknown without a defined answer and transitioning from relatively known outcomes in University coursework to unknown domains is simultaneously terrifying and exciting.

I also learned that writing a massive thesis about one focused topic is easier than I anticipated in terms of finding content and parts to investigate and explore. What might, on the outset, appear to be a straightforward project, could actually end up being something so much deeper and more advanced than you imagined. This project began with taking photos from far away but extended to so much more within the confines of my research question.

I learned that writing profound research is hard. Changing the world is hard. But doing nothing will guarantee failure but trying something will perhaps put you on a path you never anticipated in the first place. This research project was so beyond what I originally expected and there's so many more fascinating results I'd love to share, but I'll have to hold back for now until the primary research is published, so don't fret if you're a bit confused about what this is about.

All up, it was a tremendous privilege to work on this research project. <span classname="sidenote">11/10 IGN.</span> I look forward to future opportunities to engage in research both in the field of renewable energy and beyond.

P.S. This article contains references to unpublished research (hence the omission of author names). When the primary research that this project extends upon is published, this article will be updated with references and links to the published research as well as an opportunity to download my thesis. Please direct inquiries to my [email](mailto:blog@josh.house) if you have questions.