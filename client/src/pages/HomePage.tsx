import { useEffect, useState, useMemo } from 'react';
import { Heading, SimpleGrid, Text, Button, HStack, Box, NativeSelect } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Album, Recipe } from '../types';
import { albumService } from '../services/albumService';
import { recipeService } from '../services/recipeService';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import AlbumCard from '../components/albums/AlbumCard';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';


export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { openRegister } = useAuthModal();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [albumSort, setAlbumSort] = useState<'default' | 'name' | 'count'>('default');

  useEffect(() => {
    Promise.all([
      albumService.getAlbums(),
      recipeService.getRecipes({ sortBy: 'date' }),
    ])
      .then(([a, r]) => {
        setAlbums(a);
        setRecentRecipes(r.slice(0, 4));
      })
      .catch(() => setError('טעינה נכשלה.'))
      .finally(() => setLoading(false));
  }, []);

  const sortedAlbums = useMemo(() => {
    if (albumSort === 'name') return [...albums].sort((a, b) => a.name.localeCompare(b.name));
    if (albumSort === 'count') return [...albums].sort((a, b) => b.recipeCount - a.recipeCount);
    return albums;
  }, [albums, albumSort]);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;800;900&display=swap');

        @keyframes drift {
          0%,100% { transform: translateY(0) scale(1);    }
          50%      { transform: translateY(-8px) scale(1.015); }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%,100% { opacity: 0.3; transform: translate(-50%,-50%) scale(1); }
          50%     { opacity: 0.6; transform: translate(-50%,-50%) scale(1.1); }
        }
        @keyframes sparkle {
          0%,100% { opacity: 0; transform: scale(0.4) rotate(0deg); }
          50%     { opacity: 1; transform: scale(1.3) rotate(180deg); }
        }
        @keyframes starPop {
          0%,100% { opacity: 0; transform: scale(0.3); }
          40%,60% { opacity: 1; transform: scale(1); }
        }
        .hero-shimmer  { display: none; }
        .hero-shimmer2 { display: none; }
        .hero-glow {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 80%; height: 80%;
          background: radial-gradient(circle, rgba(255,255,220,0.3) 0%, rgba(255,240,200,0.1) 50%, transparent 70%);
          pointer-events: none;
          animation: glowPulse 4s ease-in-out infinite;
          z-index: 1;
        }
        .hero-spark {
          position: absolute;
          pointer-events: none;
          z-index: 3;
          border-radius: 50%;
          background: rgba(255,255,255,0.95);
          box-shadow: 0 0 6px 2px rgba(255,255,200,0.8);
        }
        .hero-spark1  { width:5px; height:5px; top:12%; left:18%; animation: sparkle 2.2s ease-in-out 0.0s infinite; }
        .hero-spark2  { width:4px; height:4px; top:30%; left:72%; animation: sparkle 2.8s ease-in-out 0.3s infinite; }
        .hero-spark3  { width:6px; height:6px; top:60%; left:38%; animation: sparkle 2.5s ease-in-out 0.6s infinite; }
        .hero-spark4  { width:3px; height:3px; top:22%; left:52%; animation: sparkle 3.0s ease-in-out 0.9s infinite; }
        .hero-spark5  { width:5px; height:5px; top:78%; left:82%; animation: sparkle 2.4s ease-in-out 1.2s infinite; }
        .hero-spark6  { width:4px; height:4px; top:45%; left:15%; animation: sparkle 2.6s ease-in-out 0.4s infinite; }
        .hero-spark7  { width:3px; height:3px; top:70%; left:60%; animation: sparkle 2.9s ease-in-out 0.7s infinite; }
        .hero-spark8  { width:5px; height:5px; top:15%; left:85%; animation: sparkle 2.3s ease-in-out 1.0s infinite; }
        .hero-spark9  { width:4px; height:4px; top:55%; left:90%; animation: sparkle 3.1s ease-in-out 0.2s infinite; }
        .hero-spark10 { width:3px; height:3px; top:85%; left:25%; animation: sparkle 2.7s ease-in-out 1.4s infinite; }
        .hero-spark11 { width:5px; height:5px; top:40%; left:45%; animation: sparkle 2.1s ease-in-out 0.8s infinite; }
        .hero-spark12 { width:4px; height:4px; top:08%; left:60%; animation: sparkle 2.5s ease-in-out 1.6s infinite; }

        .hero-wrap {
          position: relative;
          text-align: center;
          padding: 44px 20px 20px;
          margin-bottom: 40px;
          border-radius: 24px;
          overflow: hidden;
          background:
            linear-gradient(145deg, rgba(255,220,225,0.28) 0%, rgba(240,180,190,0.22) 50%, rgba(255,210,220,0.28) 100%),
            url('https://res.cloudinary.com/dayagcjez/image/upload/v1773260468/lucid-origin_Modern_elegant_kitchen_hero_background_for_a_recipe_website._Scene_A_beautiful_m-0_irbc6n.jpg') center/cover no-repeat;
        }
        .hero-blob1 {
          position: absolute; border-radius: 50%; pointer-events: none;
          width: 280px; height: 280px; top: -80px; left: -60px;
          background: radial-gradient(circle, rgba(245,180,160,0.2) 0%, transparent 70%);
          filter: blur(40px);
          animation: drift 9s ease-in-out infinite;
        }
        .hero-blob2 {
          position: absolute; border-radius: 50%; pointer-events: none;
          width: 200px; height: 200px; bottom: -50px; right: -40px;
          background: radial-gradient(circle, rgba(220,160,140,0.16) 0%, transparent 70%);
          filter: blur(32px);
          animation: drift 11s ease-in-out 2s infinite;
        }
        .hero-tag {
          display: inline-block;
          background: rgba(139,69,19,0.15);
          color: #8B4513;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 6px 16px;
          border-radius: 999px;
          border: 1px solid rgba(139,69,19,0.25);
          margin-bottom: 16px;
          font-family: 'Rubik', sans-serif;
          animation: fadeSlide 0.5s ease both;
        }
        .hero-h1 {
          font-family: 'Rubik', sans-serif;
          font-size: clamp(1.6rem, 4vw, 2.5rem);
          font-weight: 900;
          line-height: 1.2;
          color: #8B4513;
          margin-top: 4cm;
          margin-bottom: 14px;
          animation: fadeSlide 0.6s ease 0.1s both;
        }
        .hero-h1 span {
          -webkit-text-fill-color: #ffffff;
          text-shadow: 2px 3px 8px rgba(101,40,10,0.6), 0 1px 3px rgba(139,69,19,0.5);
          font-size: 1em;
        }
        .hero-p {
          font-family: 'Rubik', sans-serif;
          font-size: 0.93rem;
          font-weight: 600;
          color: #5C3520;
          line-height: 1.8;
          max-width: 440px;
          margin: 0 auto 24px;
          animation: fadeSlide 0.6s ease 0.2s both;
        }
        .hero-cta-wrap {
          animation: fadeSlide 0.6s ease 0.32s both;
        }
        .hero-cta {
          display: inline-block;
          font-family: 'Rubik', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          color: #C05A42;
          background: white;
          padding: 7px 22px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 18px rgba(200,90,66,0.15);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hero-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 26px rgba(200,90,66,0.22);
        }
        .hero-divider {
          width: 36px; height: 2px;
          background: linear-gradient(90deg, #E8A080, #D4735A);
          border-radius: 999px;
          margin: 28px auto 0;
          opacity: 0.4;
        }
      `}</style>

      {/* ── Hero ── */}
      <div className="hero-wrap">
        <div className="hero-glow" />
        <div className="hero-spark hero-spark1" />
        <div className="hero-spark hero-spark2" />
        <div className="hero-spark hero-spark3" />
        <div className="hero-spark hero-spark4" />
        <div className="hero-spark hero-spark5" />
        <div className="hero-spark hero-spark6" />
        <div className="hero-spark hero-spark7" />
        <div className="hero-spark hero-spark8" />
        <div className="hero-spark hero-spark9" />
        <div className="hero-spark hero-spark10" />
        <div className="hero-spark hero-spark11" />
        <div className="hero-spark hero-spark12" />
        <div className="hero-blob1" />
        <div className="hero-blob2" />

        <div style={{ position: 'relative' }}>
          <div className="hero-tag">כל המתכונים שלך, במקום אחד!!</div>

          <p className="hero-p">
            האתר שלנו נועד לעזור לך לסדר את המטבח בצורה חכמה ונוחה – כל המתכונים שלך במקום אחד, מסודרים וקל למצוא אותם בכל רגע. כאן תוכלי להוסיף, לשמור ולגלות מתכונים חדשים בקלות, ולהפוך את חוויית הבישול למהנה ומאורגנת יותר.
          </p>

          <h1 className="hero-h1">
            ברוכים הבאים ל‑<span>RecipeBox<span style={{WebkitTextFillColor:'#8B4513', textShadow:'none'}}>!</span></span>
          </h1>

          {!isAuthenticated && (
            <div className="hero-cta-wrap">
              <button className="hero-cta" onClick={openRegister}>הרשמי עכשיו</button>
            </div>
          )}

          <div className="hero-divider" />
        </div>
      </div>

      {/* ── Albums ── */}
      <HStack justify="space-between" mb={8} wrap="wrap" gap={4}>
        <div>
          <Heading size="2xl" mb={1} color="#7D4020" style={{ fontFamily: "'Nunito', sans-serif" }}>
            אלבומי מתכונים
          </Heading>
          <Text color="#7D6B62">עיין באוסף קטגוריות המתכונים שלנו</Text>
        </div>
        <HStack gap={3}>
          <NativeSelect.Root size="sm" minW="130px">
            <NativeSelect.Field
              value={albumSort}
              onChange={(e) => setAlbumSort(e.target.value as 'default' | 'name' | 'count')}
              bg="white" color="#7D6B62" borderColor="#F0DDD0" fontSize="sm"
            >
              <option value="default">ברירת מחדל</option>
              <option value="name">שם א–ת</option>
              <option value="count">הכי מתכונים</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          {isAuthenticated && (
            <Link to="/recipes/new">
              <Button bg="#C9848C" color="white" _hover={{ bg: '#9E6870' }} borderRadius="xl" fontWeight="700">
                + הוסף מתכון
              </Button>
            </Link>
          )}
        </HStack>
      </HStack>

      {albums.length === 0 ? (
        <Text color="gray.500" textAlign="center" py={12}>לא נמצאו אלבומים.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={6}>
          {sortedAlbums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </SimpleGrid>
      )}

      {/* ── Recent Recipes ── */}
      {recentRecipes.length > 0 && (
        <Box mt={12}>
          <HStack justify="space-between" align="baseline" mb={5}>
            <Heading size="lg" color="#7D4020" style={{ fontFamily: "'Nunito', sans-serif" }}>
              נוספו לאחרונה
            </Heading>
            <Box h="1px" flex={1} mx={4} bg="linear-gradient(90deg, #F0DDD0, transparent)" />
          </HStack>
          <Box display="flex" flexDirection="column" gap={2}>
            {recentRecipes.map((recipe, i) => (
              <Link key={recipe.id} to={`/recipes/${recipe.id}`} style={{ textDecoration: 'none' }}>
                <Box display="flex" alignItems="center" gap={4} px={4} py={3}
                  borderRadius="2xl" transition="background 0.15s" _hover={{ bg: '#FDF6F0' }} role="group">
                  <Text fontSize="xs" fontWeight="700" color="#D4B8A8" w="18px" textAlign="center"
                    flexShrink={0} style={{ fontFamily: "'Nunito', sans-serif" }}>
                    {i + 1}
                  </Text>
                  <Box w="4px" h="4px" borderRadius="full" bg="#E8C9B8" flexShrink={0} />
                  <Box flex={1} minW={0}>
                    <Text fontWeight="600" fontSize="md" color="#2D1F17" lineClamp={1}
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                      _groupHover={{ color: '#7D4F3A' }} transition="color 0.15s">
                      {recipe.name}
                    </Text>
                    {(recipe.description || recipe.albumName) && (
                      <Text fontSize="xs" color="#B08A72" lineClamp={1} mt={0.5}>
                        {recipe.albumName && <span>{recipe.albumName}</span>}
                        {recipe.albumName && recipe.description && <span> · </span>}
                        {recipe.description && <span>{recipe.description}</span>}
                      </Text>
                    )}
                  </Box>
                  <Text fontSize="sm" color="#D4B8A8" flexShrink={0}
                    _groupHover={{ color: '#A0785A' }} transition="color 0.15s">
                    ←
                  </Text>
                </Box>
              </Link>
            ))}
          </Box>
        </Box>
      )}
    </div>
  );
}
