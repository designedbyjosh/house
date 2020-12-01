import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { posts } from '../../content/articles/articles';
import './article.scss';

type ArticleProps = {
    title?: string,
    subtitle?: string,
    backgroundColor?: string,
    primaryColor?: string,
    secondaryColor?: string,
    id?: string
}


function Article({ title, subtitle, backgroundColor, primaryColor, secondaryColor, id }: ArticleProps) {

    const current = posts.filter(((article: any) => article.id === id))[0]

    return (
        <div className="viewport">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2, delay: 0.15 }}
                style={{ pointerEvents: "auto" }}
                className="overlay"
            >
                <Link to="/" className="open-link" />
            </motion.div>
            <div className="article">
                <motion.div className="article-content" layoutId={`thumbnail-container-${id}`}>
                    <motion.div
                        className="article-image-container"
                        layoutId={`thumbnail-image-container-${id}`}
                    >
                        <img className="card-image" src={`https://i.pinimg.com/originals/b8/7f/92/b87f92659e1b862ef0212086e6af7efc.jpg`} alt="" />
                    </motion.div>
                    <motion.div
                        className="article-title-container"
                        layoutId={`thumbnail-title-container-${id}`}
                    >
                        <h2>{current.title}</h2>
                    </motion.div>
                    <motion.div className="article-content-container" animate>
                        <div className="text" >
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor nunc est, efficitur ultricies eros placerat egestas. Sed ut viverra massa. Suspendisse iaculis lacinia massa at condimentum. Praesent a ante feugiat, hendrerit nunc eget, tristique magna. Suspendisse ac dolor maximus, molestie sem at, auctor purus. Aenean urna neque, placerat nec porttitor eu, sagittis sit amet purus. Phasellus commodo, enim et egestas posuere, lectus elit auctor enim, sed laoreet libero eros lobortis lectus. Praesent justo turpis, eleifend et porttitor tempor, aliquet eu nisl.

                            Vivamus sagittis enim in consequat gravida. Donec sed elit et tellus facilisis dapibus. Quisque elit massa, vestibulum sed varius quis, interdum et diam. In a mauris neque. Donec maximus euismod odio eu lobortis. Morbi quis hendrerit felis. Proin laoreet urna eu felis efficitur dictum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed leo enim, ullamcorper et neque sit amet, varius luctus libero. Vivamus porttitor nec massa nec venenatis. Vestibulum tincidunt, orci in vestibulum hendrerit, lectus sem finibus risus, eget consectetur odio nibh ac ante. Aenean eleifend sem justo, ac scelerisque erat laoreet a. Nunc in nulla vitae velit imperdiet ornare. Aenean rhoncus velit ante, in consequat magna rutrum at.

                            Nam facilisis ante velit, quis vestibulum augue tempor a. Morbi vel purus vel neque iaculis maximus. Nulla tincidunt orci ac ligula luctus, ac dictum purus elementum. Nam bibendum commodo enim eu malesuada. Mauris consectetur ac ex ut porttitor. Sed feugiat orci sit amet tortor bibendum pellentesque. Donec purus magna, venenatis id nisl eget, volutpat tincidunt urna. Maecenas pharetra non lorem vitae mattis. Aliquam pellentesque mauris in tortor facilisis rutrum. Nam commodo tempus odio, cursus luctus lorem molestie id. Mauris tempor pulvinar turpis, sit amet iaculis turpis interdum nec. Morbi lobortis lacinia efficitur. Donec sollicitudin rhoncus auctor. Vivamus ac bibendum risus. Vivamus ac tortor a mauris scelerisque ultricies eu a tellus. Nulla arcu quam, auctor sit amet accumsan in, venenatis vitae mi.

                            Sed tempor diam in neque tempus, eu mattis mi gravida. Suspendisse mattis, risus quis ultrices imperdiet, eros lorem imperdiet nunc, nec tincidunt tellus odio id nulla. Aenean eget enim sed erat aliquam accumsan. Fusce gravida ultrices sem, at laoreet libero commodo sed. Nunc euismod, purus placerat rhoncus efficitur, orci lorem iaculis mi, a posuere ante felis at est. Sed nec ligula in turpis consequat ullamcorper non nec quam. Aenean ut ornare ipsum. Integer vitae placerat enim. Duis sagittis tincidunt condimentum.

                            Nulla tristique metus semper justo tempor, ut varius nibh dignissim. Ut dapibus eget massa vitae viverra. Fusce scelerisque iaculis odio, id scelerisque purus auctor at. Sed bibendum ac dolor et consectetur. Ut dignissim facilisis dictum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam fermentum at nunc nec tempor. Pellentesque id elementum quam. Phasellus blandit nisi quis vehicula lobortis. In faucibus et nisl quis malesuada. Nunc elementum, nisl vel fermentum ultricies, nulla nisi luctus ex, nec volutpat erat nisl at mi. Donec lacus arcu, vestibulum quis justo vitae, tincidunt tincidunt eros. Maecenas semper, urna sit amet lacinia imperdiet, magna dolor bibendum erat, pulvinar convallis velit turpis non urna.

                            Aliquam erat volutpat. Sed quis porttitor sem. Nunc in risus non risus tempus porta. Morbi quis magna viverra, venenatis lectus ut, auctor augue. In hendrerit molestie tincidunt. Morbi non fringilla nisi, ac fringilla lacus. Maecenas ut dictum orci. Ut faucibus nisi at viverra elementum. In auctor augue eget augue luctus aliquet et at ex. Sed viverra tempus elit sed rhoncus.

                            Donec viverra nibh et enim porta, lobortis interdum sem aliquet. Aenean ipsum risus, suscipit a tortor sit amet, facilisis eleifend urna. Vestibulum ultrices ut dui ut malesuada. Nam purus mi, feugiat non blandit nec, convallis vitae ex. Mauris et placerat eros, convallis gravida diam. Vivamus dui elit, ultricies in odio quis, tincidunt sodales ipsum. Mauris urna erat, lobortis faucibus bibendum nec, rhoncus sit amet risus. In purus ipsum, suscipit ac vulputate dictum, tristique nec sem. Donec et suscipit odio. Donec consequat mi mauris, quis dapibus enim imperdiet nec. Cras vestibulum arcu ligula, a aliquet augue dictum eu. Maecenas posuere lorem in pretium dapibus. Praesent lacinia mi sed nisl tincidunt convallis. Maecenas a sollicitudin nulla. Etiam auctor est eget nisi auctor blandit.

                            Nullam rutrum pellentesque tortor sed lacinia. Pellentesque aliquam leo sed orci ullamcorper vestibulum. Nam nec fermentum est. Donec dignissim viverra consectetur. Aliquam quis feugiat velit. Nullam a lorem in tellus auctor tempus. Mauris consequat imperdiet dolor, sed interdum libero volutpat a.

                            Duis mattis luctus lacus, in faucibus nisi volutpat vitae. In facilisis pharetra sagittis. Mauris hendrerit est eu libero rhoncus, id interdum neque molestie. Aenean eget ante tempus, pellentesque orci vel, varius lacus. Duis ullamcorper tortor at justo consectetur, et suscipit ipsum sagittis. Donec mauris ligula, tincidunt vel nunc in, aliquam convallis magna. Vestibulum euismod, arcu vitae bibendum hendrerit, dolor magna sollicitudin tortor, vel bibendum nisl velit faucibus enim. Aliquam erat volutpat. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Quisque malesuada leo eget lectus posuere, quis aliquam justo rhoncus.

                            Phasellus sed enim tristique, ornare nulla sit amet, facilisis libero. Vestibulum aliquet ante non euismod eleifend. Ut iaculis purus lorem, quis varius est accumsan venenatis. Integer placerat fermentum dignissim. Mauris tincidunt, ex id varius aliquet, tortor nulla accumsan magna, a lobortis tellus neque ut nisl. Curabitur nec arcu ac nisi egestas laoreet. Integer aliquet arcu libero, sit amet accumsan lorem tempus non. Nullam eu commodo orci. Etiam scelerisque nulla ex, vel rutrum ante molestie in. Pellentesque mattis lorem a lectus fringilla, id facilisis diam egestas. Aliquam pharetra velit eget ligula bibendum, vitae faucibus lorem venenatis. Donec placerat tellus sit amet elementum venenatis.

                            In at mi nec ligula ullamcorper fermentum et id arcu. Cras et sem quis mi tincidunt imperdiet. Morbi bibendum rhoncus lorem a tincidunt. Curabitur eleifend, dolor bibendum fringilla ultrices, eros purus dapibus tortor, non blandit libero ipsum eu ipsum. Ut ex nibh, gravida nec felis sed, ultrices mattis lorem. Ut lobortis faucibus metus eu vehicula. Curabitur a ante venenatis sapien aliquam pulvinar. Vestibulum nec leo congue, ullamcorper erat sed, viverra mi. Vivamus tellus purus, ornare at pulvinar sit amet, rutrum in ligula. Nulla feugiat felis id nunc tincidunt, eget elementum ipsum dapibus. Maecenas ornare dolor at metus varius, vel gravida mi porta. In ac porta mi. Ut facilisis erat vitae augue luctus consequat. Integer nec ligula at arcu semper tempus ac nec dui. Vivamus bibendum volutpat purus vel congue. Nulla id eros eu ligula pellentesque eleifend id lobortis elit.

                            Morbi ut dolor blandit, blandit magna in, auctor tellus. Proin nec mi et justo venenatis porta et ut odio. Cras at ante neque. Etiam sed lacus dolor. Donec sapien dui, ornare eu quam eget, aliquet rhoncus ligula. Morbi rhoncus sem nunc, vel sagittis dolor hendrerit tempus. Duis eleifend a urna eu euismod. Suspendisse vel eros dapibus, iaculis odio id, aliquam nisi. Integer sapien augue, gravida non blandit et, convallis nec ex. Suspendisse bibendum ante sed tempor maximus. Fusce risus neque, ullamcorper vel augue id, volutpat suscipit felis. Morbi consequat dui orci, sit amet rutrum velit volutpat eget.

                            Sed ac ullamcorper quam. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi viverra nunc ut erat pulvinar porttitor. Nam consequat semper tristique. Vivamus nec nisl maximus, vehicula arcu vitae, hendrerit lacus. Suspendisse aliquam interdum metus, suscipit ultricies orci sollicitudin quis. Mauris libero ligula, pharetra in ante et, hendrerit tempus leo.

                            Interdum et malesuada fames ac ante ipsum primis in faucibus. Integer maximus tortor blandit nulla vestibulum congue. Quisque consectetur mi non velit aliquam, in fringilla sapien malesuada. Aliquam ante tortor, mollis sed dictum at, iaculis et nunc. Sed aliquet mi justo, nec lacinia leo tempor sit amet. Pellentesque posuere mi quam, nec egestas sapien viverra fermentum. Donec sit amet volutpat nibh. Nullam a aliquet diam. In in odio eget eros vehicula porttitor. Vestibulum tristique lobortis lorem, at convallis nunc commodo non. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Phasellus sit amet eros blandit, iaculis enim vitae, facilisis nisl. In facilisis mauris ac neque tempor sodales.

                            Sed volutpat felis ut urna luctus pharetra et sit amet velit. Cras eget velit pretium, maximus diam vel, rhoncus erat. Donec rhoncus pulvinar dolor, fringilla laoreet tortor consectetur non. Suspendisse ac libero vitae libero ornare suscipit. Proin id sagittis metus, eget lobortis nulla. Pellentesque hendrerit cursus pellentesque. Pellentesque ac luctus sapien, vel ultrices elit. In condimentum varius elit, in facilisis sem interdum ac. Praesent ultrices faucibus est.

                            Maecenas lacinia sollicitudin urna nec tempus. Vivamus a euismod nibh. In malesuada, sapien vitae pulvinar finibus, odio tellus rhoncus ipsum, a dictum nisl magna sit amet eros. Mauris dictum pretium turpis, a fringilla diam efficitur non. Nulla rhoncus, ex eget ullamcorper imperdiet, velit enim congue metus, id efficitur massa sapien eu purus. Nam dictum placerat risus in efficitur. Morbi pretium consequat diam aliquet mattis. Cras in magna tristique, mattis nisl ac, sollicitudin eros. Aliquam quis lectus lacinia, aliquet velit sit amet, suscipit urna.

                            Proin sit amet arcu at nisi egestas tincidunt quis eget mi. Donec lorem nunc, iaculis at ante vestibulum, varius volutpat tellus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Maecenas sed vehicula nibh. Praesent porttitor nisi ac elit congue consectetur. Nullam malesuada ultricies egestas. Donec eleifend lorem ut nibh eleifend, id mattis arcu accumsan. Proin fringilla eros molestie, pharetra velit a, sagittis lectus. Donec dignissim, erat id consectetur porttitor, tellus sapien posuere sem, a imperdiet neque metus vitae quam. Sed quis risus libero.

                            Suspendisse a orci justo. Cras iaculis odio nec bibendum porttitor. Cras quis lobortis ex. Mauris semper finibus turpis non ullamcorper. Phasellus a nisl et tortor viverra semper. Aenean lorem nibh, sodales eget felis et, vestibulum lobortis arcu. Vivamus bibendum, justo sit amet dapibus maximus, nulla libero tempor mi, nec accumsan sem neque convallis risus. In semper, neque in tempus suscipit, orci nisi eleifend erat, a bibendum enim nisi ac orci. Proin vel congue felis. Sed condimentum odio a tellus malesuada dignissim. Etiam a velit massa. Nam elit arcu, maximus vel ultrices vel, pretium et arcu.

                            Quisque id feugiat lectus. Suspendisse potenti. Mauris non nibh mattis, blandit risus sed, dictum mauris. Cras sit amet mattis tellus. Nunc felis tortor, pretium vel felis ut, luctus tempor enim. Nunc in quam sed turpis rutrum molestie a sed eros. Duis sed posuere mauris. Vestibulum ac maximus sapien. Nullam sed odio elit. Suspendisse in commodo lectus. Nullam feugiat dignissim odio ut commodo. Mauris metus nulla, viverra sit amet cursus vel, euismod non augue. Sed eu ex nec risus dictum faucibus non ut augue. Nunc mi tellus, ullamcorper eget iaculis maximus, tempor ac leo. Nullam faucibus lorem tellus, id dapibus ex condimentum vitae.

                            Etiam sit amet erat elit. Praesent tincidunt turpis vel velit tristique, ac convallis arcu fringilla. Nullam accumsan massa eget pulvinar ultricies. Cras ut nisi hendrerit, egestas neque vitae, convallis augue. Cras posuere elementum mi eu sagittis. In ac semper neque, at ornare mauris. Sed vitae tempor elit, dapibus rhoncus tellus. Maecenas lorem enim, rhoncus in vulputate sit amet, iaculis eget turpis. Nulla justo tortor, vestibulum id enim ac, dignissim scelerisque nulla. Nulla vestibulum leo sed risus iaculis euismod. Mauris feugiat aliquet vulputate. Phasellus id mauris vel risus fermentum dictum. Praesent eget purus eget velit volutpat finibus nec sollicitudin lorem. Pellentesque ipsum est, tempor quis hendrerit ac, ullamcorper vitae elit.

                            Nulla viverra ipsum vitae scelerisque elementum. Phasellus eget arcu accumsan, auctor lacus eget, accumsan odio. Quisque id dictum lorem. Etiam suscipit iaculis dignissim. Suspendisse feugiat ac lectus ac faucibus. Vivamus accumsan urna orci, non commodo dui blandit in. Aliquam quis consequat nunc. Maecenas congue vel turpis et porta. Ut tristique justo dignissim turpis rutrum, vehicula bibendum justo sollicitudin. Sed consequat tellus risus, ut posuere enim imperdiet a. Fusce in ullamcorper nulla. Duis aliquet lorem vitae vehicula tempor. Pellentesque sit amet lorem et ante consequat fermentum. Nullam non mollis libero, id feugiat ipsum.

                            Duis lobortis, mi quis tristique viverra, nisi nibh fermentum magna, at semper erat sem sed justo. Sed bibendum, ex faucibus convallis congue, quam metus ornare erat, lacinia consectetur ligula ipsum non ex. Curabitur a pellentesque erat. Sed magna neque, convallis non lorem nec, porta cursus neque. Donec elit quam, auctor ac lobortis eu, lacinia eu neque. Phasellus et nisi auctor tortor congue facilisis vel non lorem. Suspendisse dignissim vitae arcu eu suscipit. Quisque ac blandit ante. Quisque efficitur justo sed sapien laoreet, eu fringilla enim varius. Integer egestas ex eget vehicula facilisis. Nunc ut pharetra nibh, sit amet ornare ligula. Phasellus eget ex aliquam, elementum sem in, tristique tortor. Vestibulum vel vestibulum dolor. Praesent at tortor vehicula, lacinia diam in, consectetur tortor. Ut ultricies libero at ullamcorper imperdiet. Nunc egestas, urna sit amet iaculis finibus, nibh erat viverra nulla, in porttitor odio magna sed lacus.

                            Cras porttitor nisl id lectus consectetur dictum. Fusce eget tempor neque. Nulla et nisi dui. Nam dui sem, facilisis id gravida vitae, blandit a nisi. Ut commodo sollicitudin ex eu sodales. Sed laoreet sapien vitae metus euismod, ac tincidunt tellus finibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam nulla lorem, volutpat sed magna sit amet, bibendum pulvinar nisl. Suspendisse diam velit, ornare a leo nec, porta tincidunt augue. Nulla viverra aliquet tellus. Integer dolor sem, imperdiet id blandit et, eleifend sed augue. Aenean vel eleifend sem. Sed ipsum felis, pulvinar in semper non, faucibus eget est. Morbi lacinia metus a hendrerit tristique. Proin at volutpat metus. Pellentesque at accumsan turpis.

                            Nam a ex a diam aliquam feugiat. Phasellus volutpat augue nisi, at cursus lacus accumsan venenatis. Nulla eu lorem dui. Aliquam finibus, ligula ac sagittis sollicitudin, eros ligula fermentum neque, non fringilla nisi sapien a tellus. Donec ut risus purus. Mauris vitae finibus massa. Donec iaculis ullamcorper finibus. Nullam volutpat quis dui eget semper. Cras quis velit a diam cursus ornare.

                            Donec feugiat pharetra augue ac suscipit. Nullam id neque sapien. Integer ornare et leo dapibus lacinia. Fusce a auctor lectus, a mattis nisl. Nulla orci erat, euismod at lacinia ac, malesuada sed enim. In id elit quis justo consectetur mattis. Curabitur placerat aliquet augue a pharetra. Sed in sagittis leo, a eleifend est. Duis dui nulla, tincidunt in sapien non, rhoncus finibus lectus. Sed vehicula a risus sit amet feugiat. Integer dapibus pretium sapien ac congue. Praesent lorem nunc, ultrices id congue sit amet, vehicula et velit. Nunc ullamcorper est sapien, et cursus massa malesuada id. Curabitur at lacus lobortis, scelerisque lectus ac, egestas augue. Suspendisse fermentum consequat consequat. Nam at ornare purus.

                            Aliquam vestibulum felis lectus, vitae tincidunt nisi congue vel. Suspendisse aliquet massa lacus, in interdum arcu semper at. Nunc eleifend nulla viverra, sagittis quam ac, dignissim ligula. Aliquam et ex fermentum, hendrerit diam vulputate, maximus eros. Nulla cursus lacus eget ex vehicula blandit. Vivamus malesuada mollis arcu, eu tempor nulla finibus nec. Ut placerat convallis justo sit amet euismod. Cras pretium ullamcorper aliquet. Donec dignissim mi at magna porttitor tempus. Proin tempor in urna vel efficitur. Sed eu tincidunt felis.

Phasellus eget ante a eros viverra accumsan. Suspendisse bibendum a tellus sed malesuada. Phasellus vel quam id neque luctus fermentum eget suscipit magna. Nam mattis diam et nulla consectetur, ut consequat ipsum lacinia. Nulla vulputate lobortis est ut maximus. Praesent vitae commodo tortor. In maximus egestas congue. Pellentesque ullamcorper dui a lacus blandit luctus. Vivamus ac nulla vitae ligula mollis faucibus. Sed sollicitudin, tellus a imperdiet fringilla, velit tellus molestie nisi, at venenatis nunc massa dapibus enim. Praesent convallis feugiat libero non hendrerit.</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}

export default Article;
