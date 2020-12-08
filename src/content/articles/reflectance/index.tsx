import React from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Asset Imports
import solar from './assets/images/solar.jpg';
import cool_machine from './assets/images/extra_cool_machine.png';
import receiver from './assets/images/receiver.jpg';
import roast from './assets/images/roast.jpg';
import Image from '../../../component/article/image';
import rig from './assets/images/epic_custom_rig.png';
import { simulated } from './assets/data/reflectance';

const content: React.FC = () => {

  const chartOne = <div style={{ width: '90%', height: 300 }}>
    <ResponsiveContainer>
      <LineChart data={simulated}>
        <XAxis stroke="white" domain = {['auto', 'auto']} minTickGap={50} dataKey="PPM" padding={{ left: 30, right: 30 }}/>
        <YAxis stroke="white"/>
        <Tooltip contentStyle={{backgroundColor: 'slate', borderRadius: 20}} labelFormatter={(value) => `PPM: ${value}`} formatter={(value) => `${value}%`}/>
        <Line type="monotone" dataKey="Error"  stroke="orange" dot={{r: 1}} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>

  return (
    <>
      <h2>enter stage left: develop raport</h2>
      <p>Over the past 12 months I've been conducting research here in Australia in the field of renewable energy as part of my mechatronics engineering bachelors. At least that's what I told myself coming into the project anyway.
        As part of becoming an engineer, it is required that you complete a substantial research project which, here in Australia, is called your <b>honours</b> year. The objective being to develop skills in research and to have the privilege of contributing to your field of choice.
        Yes, I worked across two completely different fields because, as they say, <a href="https://medium.com/@christos.a.makridis/why-breadth-is-important-for-depth-54ddc5317ff9">breadth is more important than depth</a>.
        In all seriousness though, I thought that if there was going to be an opportunity to help save the planet, at least even by a little bit, it was obviously in doing research with cameras, giant mirrors and cool <span className="sidenote">(reflectometers shoot lasers btw)</span> gear.
        </p>
      <Image src={cool_machine} caption={"Figure 1 - The really cool (a.k.a expensive) reflectometer"} />
      <p>This, however, is all peripheral to what it really takes to become an engineer which includes: fixing at least 25 routers, reminding at least 50 people that you aren't an IT specialist and then convincing a further 100 people that there's more to mechatronics than just robots.
      You also learn that you can't work out how to fix a broken electric couch, even though it's a mechatronics system.
        But you can try using duct tape and faith. And as it turns out, there's a lot more in this world <a href="https://www.booktopia.com.au/duct-tape-engineer-lance-akiyama/book/9781631591303.html">running on duct tape</a> than I first thought.</p>
      <h2>enter stage right: actual content</h2>
      <p>
        So, the whole purpose of this year is to focus on one big overarching inquiry, called a <b>research question</b>, and then spending the whole year working towards answering that single question. As well as navigating the panic, fear and 2-day-prior rewrites that you all went through when you did a research project as well, <i>right?</i>
      </p>
      <p>
        In my case, my research question was a collaborative effort with my supervisors which stemmed from some existing research into their method of using a stochastic multimodal soiling model to estimate the reflectance of a mirror. Let's rewind a little before we continue on though and look at some pretty pictures and stuff to explain this better.
        </p>
      <Image src={receiver} caption={"Figure 2 - A receiver getting heaps of tasty light"} reference="https://www.google.com/url?sa=i&url=http%3A%2F%2Fhelioscsp.com%2Fcentral-receiver-and-linear-systems-will-contribute-to-achieve-lower-concentrated-solar-power-costs%2F&psig=AOvVaw3tF4P7Lq_qQyYCBiy0y_0l&ust=1607418270758000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCPiq--nBu-0CFQAAAAAdAAAAABAD" />
      <p>
        In concentrated solar farms, like the one at the top of this post, mirrors focus light onto a central receiver which: (1) heats up a fluid; then, (2) the hot fluid produces steam; then, (3) the steam spins a turbine; and lastly, (4) the spinning turbine makes power.
        </p>
      <p>
        It's a pretty phenomenal process to generate power, and it works swimmingly. The problem, however, is that dirty mirrors reduce the amount of energy hitting that central receiver. Dirt can be bird droppings, dust or a damn fine roast lunch cooking on a mirror <span className="sidenote">(see Figure 3)</span>. My research was designed to extend upon existing research to identify whether instead of using drones to take close up pictures of a mirror to estimate reflectance, we could use one massive camera <span className="sidenote">(or a few smaller ones around the plant)</span> to do it all for us. In other words, remove any need for a human to interact with this whole system, beyond the actual cleaning process.
        </p>
      <Image src={roast} caption="Figure 3 - A finely cooked roast lunch slow cooked on a heliostat mirror; and other weird reasons why Josh still hasn't had dinner yet at 10PM" reference="https://cdn-b.william-reed.com/var/wrbm_gb_hospitality/storage/images/publications/hospitality/morningadvertiser.co.uk/pub-food/news/how-to-make-the-best-pub-roast-dinner/3147308-1-eng-GB/How-to-make-the-best-pub-roast-dinner.jpg" />
      <h2>but, how?</h2>
      <p>
        So, in early 2020, I set off with my giant mirrors, my camera and started testing the robustness of the estimation algorithm. <span className="sidenote">Plot twist, the algorithm was in development simultaneously to my research which introduced challenges</span>. And over the following year I quickly discovered that there is so much more to taking pictures than opening the Camera app and clicking that big white circle.
        </p>
      <p>
        The project involved two stages in evaluating the robustness of the estimation algorithm to spatial resolution degradation in tandem with the effect of changing capture parameters. The stages were <b>the Acquisition Phase</b>, where I physically took photos for my study, followed by <b>the Processing Phase</b>, where the images were processed and I made conclusions. Over 1000 images were taken over 11 different days with the total size of the dataset reaching almost 1TB in imagery.
        </p>
      <p>
        Images were captured using a Canon EOS 550D from 2010 with an 18 megapixel (MP) effective resolution (18.7MP total). The camera type was a TTL-CT-SIR AF-dedicated with a CMOS sensor. I used a tripod to stabilise the camera, particularly when using low shutter-speeds, and three separate lenses were used for several different datasets.
        </p>
      <Image src={rig} caption={"Figure 4 - My epic COVID rig to hold two differently soiled mirrors made using a highly reliable ladder from Bunnings and the trusty power of faith and duct tape"} />
      <p>
        Images were captured in ranges from 1m up to 70m across several days throughout the year. Due to dependence of the estimation algorithm on the heliostat mirror being directed at a clear blue sky, the days in which images could be captured were limited to clear conditions with daylight. Heliostat mirrors must be carefully directed, as certain angles can result in sunlight flaring <span className="sidenote">(which is when streaks become white at certain angles)</span> and possibly result in incorrectly classified soiling components.
      </p>
      <p>The timing of the image capture varied from early morning to late afternoon to assist in the reduction of sunlight flaring on the heliostat mirrors. The mirror direction and angle relative to the camera was carefully selected as several early datasets were rendered useless as a result of flaring from cleaning streaks. To assist in the heliostat mirror positioning, the mirrors were placed at several angles using an improvised rig consisting of a step ladder and adhesive padding <span className="sidenote">(also known as duct tape and faith)</span> to secure the mirrors in heavy winds.</p>
      <h2>well, the verdict?</h2>
      <p>The estimation algorithm is actually really robust to increased distance. Now, by increased distance, yes there's the option of zooming in from far away, but what we're examining here is pixel density measured in PPM <span className="sidenote">(pixels per metre)</span>. The lower the PPM value, the lower the resolution and theoretically, the lower the file. What I found is intuitive at first glance, of course, it's less reliable at lower resolutions. 
      Less information equates to more unsurity and greater proximity to the noise floor (random jibberish underlying everything). What's interesting, however, is that the estimation algorithm is actually robust down to below 200PPM as shown in Figure 5 below. </p>
      {chartOne}
      <p className="caption">Figure 5 - Comparison of (y) average error (% difference to reflectometer measurement or "ground truth") in reflectance estimation for a mirror when resolution (PPM) is decreased (x)</p>
      <p>This far exceeds our expectations and represents an important shift in perspective on how we can apply the reflectance estimation algorithm. Currently, single images are taken of a mirror by a drone floating above it. But, now we realise we could perhaps have a drone fly way up in the sky and capture images with far more mirrors in a single image, pull them out using a contour detector and automagically estimate reflectance for entire fields in one go! <span className="sidenote">Well, probably not entire fields but significantly more than we could before, anyway.</span></p>
      <p>Let's not finish up there though. So, in the above data we found that in simulated imaging conditions, that is, using bilinear interpolation to shrink images down intentionally we're actually getting really solid performance. But with less data, naturally, we're getting far better performance as well. Less data to process is a win-win for everybody right? Well, this is particularly the case when the estimation algorithm still produces reliable results.</p>
      <p>So, we've established that the approach works fine up to a certain point before failure, by measuring the processing time to reach an estimation will reveal there's actually a limit to finding a solid result here. That plot, however, is still a work in progress.</p>
      <h2>so, what did I learn?</h2>
      <p>I learned that research is extraordinarily difficult and I have immense respect for the researchers of the world. It's a completely different life traversing the unknown without a defined answer and transitioning from relatively known outcomes in University to unknown domains is simultaneously terrifying and exciting.</p>
      <p>I also learned that writing a massive thesis about one focused topic is easier than I anticipated in terms of finding content and parts to investigate and explore. What might, on the outset, appear to be a straightforward project, could actually end up being something so much deeper and more advanced than you imagined. This project began with taking photos from far away but extended to so much more within the confines of my research question.</p>
      <p>I learned that writing profound research is hard. Changing the world is hard. But doing nothing will guarantee failure but trying something will perhaps put you on a path you never anticipated in the first place.</p>
      <p>All up, it was a tremendous privilege to work on this research project. <span className="sidenote">11/10 IGN.</span> I look forward to future opportunities to engage in research both in the field of renewable energy and beyond.</p>
      <p className="sidenote tiny">P.S. This article contains references to unpublished research (hence the omission of author names). When the primary research that this project extends upon is published, this article will be updated with references and links to the published research as well as an opportunity to download my thesis. Please direct inquiries to my <a href="mailto:blog@josh.house">email</a> if you have questions.</p>
    </>
  )

}

const metadata = {
  id: "reflectance",
  category: {name: "Academic", icon: "fas fa-books"},
  title: "Cameras, mirrors and soiling? A year of reflection",
  focusIndex: 120,
  color: "#2cb2ff",
  backgroundColor: "dark-gray",
  image: { src: solar, author: "Ethan Miller (Getty)", alt: "Shangai Solar Farm by Oakland" },
  published: Date.parse("2020-10-30T12:00:00Z"),
  tldr: "i researched, using long range cameras with existing methods, a way to estimate reflectance of mirrors for large solar farms."
} as ArticleMetadata

export default { metadata, content } as Article