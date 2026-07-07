import { Composition } from 'remotion'
import { ResaVSL, FPS, DURATION } from './ResaVSL'
import { CarboTestimonial, CARBO_FPS, CARBO_DURATION } from './CarboTestimonial'
import { ResaLinkedInPost, RESA_LI_FPS, RESA_LI_DURATION } from './ResaLinkedInPost'
import { ResaAvisGoogle, AVIS_FPS, AVIS_DURATION } from './ResaAvisGoogle'

export const RemotionRoot = () => (
  <>
    {/* 16:9 Web — embed on landing page */}
    <Composition
      id="ResaVSL"
      component={ResaVSL}
      durationInFrames={DURATION}
      fps={FPS}
      width={1280}
      height={720}
    />

    {/* 1:1 Square — LinkedIn / Instagram feed */}
    <Composition
      id="ResaVSL-Square"
      component={ResaVSL}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1080}
    />

    {/* 9:16 Vertical — Reels / Stories / TikTok */}
    <Composition
      id="ResaVSL-Vertical"
      component={ResaVSL}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1920}
    />

    {/* ── CARBO testimonial / case-study motion design ── */}
    <Composition
      id="CarboTestimonial"
      component={CarboTestimonial}
      durationInFrames={CARBO_DURATION}
      fps={CARBO_FPS}
      width={1280}
      height={720}
    />
    <Composition
      id="CarboTestimonial-Square"
      component={CarboTestimonial}
      durationInFrames={CARBO_DURATION}
      fps={CARBO_FPS}
      width={1080}
      height={1080}
    />
    <Composition
      id="CarboTestimonial-Vertical"
      component={CarboTestimonial}
      durationInFrames={CARBO_DURATION}
      fps={CARBO_FPS}
      width={1080}
      height={1920}
    />

    {/* ── RESA LinkedIn post — "4 restaurants. 1 outil." ── */}
    <Composition
      id="ResaLinkedInPost"
      component={ResaLinkedInPost}
      durationInFrames={RESA_LI_DURATION}
      fps={RESA_LI_FPS}
      width={1080}
      height={1080}
    />
    <Composition
      id="ResaLinkedInPost-Vertical"
      component={ResaLinkedInPost}
      durationInFrames={RESA_LI_DURATION}
      fps={RESA_LI_FPS}
      width={1080}
      height={1350}
    />

    {/* ── RESA — Nouvelle fonctionnalité : demande d'avis Google ── */}
    {/* 9:16 Vertical — Instagram Reels / Stories */}
    <Composition
      id="ResaAvisGoogle"
      component={ResaAvisGoogle}
      durationInFrames={AVIS_DURATION}
      fps={AVIS_FPS}
      width={1080}
      height={1920}
    />
  </>
)
