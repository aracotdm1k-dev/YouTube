const hoursAgo = (hours) => new Date(Date.now() - hours * 3600000).toISOString()
const images = {
  gaming: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=720&h=405&fit=crop', car: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=720&h=405&fit=crop',
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=720&h=405&fit=crop', entertainment: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=720&h=405&fit=crop',
  tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=720&h=405&fit=crop', music: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=720&h=405&fit=crop',
  news: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=720&h=405&fit=crop', food: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=720&h=405&fit=crop',
  travel: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=720&h=405&fit=crop',
}
const avatar = {
  pewdiepie: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces', markiplier: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces',
  netflix: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=96&h=96&fit=crop', baby: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop&crop=faces',
  christmas: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=96&h=96&fit=crop&crop=faces',
  caseoh: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=96&h=96&fit=crop&crop=faces', grace: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop&crop=faces',
  stray: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=96&h=96&fit=crop&crop=faces',
}
const makeVideo = (id, title, channel, channelId, channelAvatar, thumbnail, views, hours, category, youtubeId, duration, description) => ({ id, title, channel, channelId, channelAvatar, thumbnail, views, publishedAt: hoursAgo(hours), category, youtubeId, duration, description })

export const videos = [
  makeVideo('v1', 'Lil Baby - Aint Goin (Official Music Video)', 'Lil Baby Official', 'lil-baby', avatar.baby, 'https://i.ytimg.com/vi/BYYdzzyWhTU/hqdefault.jpg', 286700, 15, 'Music', 'BYYdzzyWhTU', '2:40', 'The official music video. Listen now and find more music from Lil Baby.'),
  makeVideo('v2', 'Twilight (But Better) Teaser Trailer', 'Grace Reiter', 'grace-rie', avatar.grace, 'https://i.ytimg.com/vi/5GB00NsVH3Q/hqdefault.jpg', 438700, 18, 'Entertainment', '5GB00NsVH3Q', '1:40', 'A new take on a story about love, mystery, and the supernatural.'),
  makeVideo('v3', 'TREES HATE YOU... (Full Game Part 1)', 'CaseOh', 'caseoh', avatar.caseoh, 'https://i.ytimg.com/vi/vObY1I1C2Y4/hqdefault.jpg', 604400, 10, 'Gaming', 'vObY1I1C2Y4', '1:48:05', 'We take on the strangest forest survival game and immediately regret it.'),
  makeVideo('v4', 'Top Christmas Songs of All Time Playlist - Best Christmas Music 2025', 'Christmas Songs and Carols - Love to Sing', 'christmas-songs', avatar.christmas, 'https://i.ytimg.com/vi/bZXBgchXJc8/hqdefault.jpg', 150600, 36, 'Music', 'bZXBgchXJc8', '2:36:02', 'A festive collection of timeless holiday favorites for the season.'),
  makeVideo('v5', '3 Body Problem: Season 2 | Official Teaser | Netflix', 'Netflix', 'netflix', avatar.netflix, images.entertainment, 1200000, 21, 'Entertainment', '9bZkp7q19f0', '1:48', 'The next chapter begins. Watch the official teaser for the new season.'),
  makeVideo('v6', 'MONOCHROME', 'Markiplier', 'markiplier', avatar.markiplier, images.gaming, 1100000, 15, 'Gaming', 'L_jWHffIx5E', '16:07', 'One choice. One strange world. Let us see what happens.'),
  makeVideo('v7', 'I.N "NO RETURN" | Stray Kids : SKZ-PLAYER', 'Stray Kids', 'stray-kids', avatar.stray, images.music, 1500000, 28, 'Music', 'CevxZvSJLk8', '3:36', 'A special performance video from I.N of Stray Kids.'),
  makeVideo('v8', 'AVENGERS DOOMSDAY NEW PROMO X-Men, Doctor Doom & Kang', 'Emergency Action', 'emergency-action', avatar.baby, images.entertainment, 372100, 9, 'Entertainment', 'RgKAFK5djSk', '8:22', 'A look at the latest superhero movie news and fan theories.'),
  makeVideo('v9', 'GTA 6: Everything We Know So Far', 'PewDiePie', 'pewdiepie', avatar.pewdiepie, images.car, 890000, 12, 'Gaming', 'OPf0YbXqDm0', '14:29', 'Breaking down the latest details, locations, and theories from the community.'),
  makeVideo('v10', 'The New Electric Roadster Is Here', 'PewDiePie', 'pewdiepie', avatar.pewdiepie, images.car, 320000, 31, 'Automobiles', 'YQHsXMglC9A', '11:06', 'A closer look at the design, range, and driving experience of the latest electric roadster.'),
  makeVideo('v11', 'I Tried Training Like an Olympic Sprinter', 'Markiplier', 'markiplier', avatar.markiplier, images.sports, 720000, 40, 'Sports', 'JGwWNGJdvx8', '18:44', 'A week of speed drills, strength work, and trying to keep up with the pros.'),
  makeVideo('v12', 'The Tiny Computer That Changed My Setup', 'PewDiePie', 'pewdiepie', avatar.pewdiepie, images.tech, 218000, 50, 'Technology', 'fJ9rUzIMcZQ', '9:51', 'A compact computer, a clean desk, and a surprisingly capable everyday setup.'),
  makeVideo('v13', 'A Quiet Morning in Kyoto | Travel Diary', 'Grace Reiter', 'grace-rie', avatar.grace, images.travel, 98000, 62, 'Blogs', 'hT_nvWreIhg', '12:18', 'Walking through Kyoto just after sunrise, with a few favorite stops along the way.'),
  makeVideo('v14', 'What Happened in Tech This Week?', 'Netflix', 'netflix', avatar.netflix, images.news, 540000, 72, 'News', '9bZkp7q19f0', '7:34', 'The biggest product launches and technology stories, explained in a few minutes.'),
  makeVideo('v15', 'My 5-Minute Weeknight Dinner', 'Grace Reiter', 'grace-rie', avatar.grace, images.food, 176000, 80, 'Blogs', '3JZ_D3ELwOQ', '6:10', 'A fast, comforting weeknight meal using a few pantry staples.'),
  makeVideo('v16', 'Inside the Most Advanced Concept Car', 'Markiplier', 'markiplier', avatar.markiplier, images.car, 2100000, 96, 'Automobiles', 'kJQP7kiw5Fk', '15:42', 'We explore the cabin, technology, and ambitious details of a next-generation concept car.'),
  makeVideo('v17', 'Championship Point: The Final Rally', 'Emergency Action', 'emergency-action', avatar.baby, images.sports, 980000, 108, 'Sports', 'CevxZvSJLk8', '5:19', 'The decisive final moments from an unforgettable championship match.'),
  makeVideo('v18', 'This New Phone Camera Is Actually Different', 'PewDiePie', 'pewdiepie', avatar.pewdiepie, images.tech, 641000, 120, 'Technology', 'OPf0YbXqDm0', '10:24', 'Testing the camera in daylight, at night, and in a few situations that usually trip phones up.'),
  makeVideo('v19', 'The Song Everyone Is Talking About', 'Lil Baby Official', 'lil-baby', avatar.baby, images.music, 3200000, 132, 'Music', 'dQw4w9WgXcQ', '3:58', 'The official video for the latest single. Thanks for listening.'),
  makeVideo('v20', 'A First Look at the New Fantasy Series', 'Netflix', 'netflix', avatar.netflix, images.entertainment, 840000, 144, 'Entertainment', 'RgKAFK5djSk', '2:08', 'Enter a new world in this first look at the upcoming fantasy series.'),
  makeVideo('v21', 'Building a Cozy Gaming Room from Scratch', 'CaseOh', 'caseoh', avatar.caseoh, images.gaming, 437000, 168, 'Gaming', 'L_jWHffIx5E', '22:40', 'Planning a warm, practical gaming space with better lighting and less clutter.'),
  makeVideo('v22', 'The Week in World News, Explained', 'Emergency Action', 'emergency-action', avatar.baby, images.news, 190000, 192, 'News', 'YQHsXMglC9A', '8:02', 'A concise guide to the stories shaping the week around the world.'),
  makeVideo('v23', 'The Scenic Route: Pacific Coast in 4K', 'Grace Reiter', 'grace-rie', avatar.grace, images.travel, 580000, 216, 'Blogs', 'hT_nvWreIhg', '24:16', 'A slow drive along the coast, with a few stops for the views and good coffee.'),
  makeVideo('v24', 'Can This Classic Car Still Keep Up?', 'Markiplier', 'markiplier', avatar.markiplier, images.car, 1300000, 240, 'Automobiles', 'fJ9rUzIMcZQ', '13:11', 'Taking a beloved classic out for a proper drive and seeing how it feels today.'),
]