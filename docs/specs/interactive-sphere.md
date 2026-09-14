# Interactive sphere and tactile controls

Status: done

## Behavior

- A short primary click or tap inside the projected sphere launches a restrained
  radial wave. Desktop hover uses a pointer cursor only over the interactive area.
- Activating the avatar launches a distinct, longer three-dimensional twist and
  radial wave, with a perspective lift of the portrait. Enter and Space work too.
- One bounded pulse runs at a time; repeated input cannot accumulate animation
  queues, energy or render loops. Pulses never change scroll progress or logo paths.
- Drag, long press, secondary pointers, page scrolling and other controls do not
  activate the sphere. Native touch scrolling and zoom remain available.
- Paused scenes do not animate. Reduced-motion and unavailable-WebGL presentations
  retain static avatar focus/pressed feedback, without loading the scene.
- Controls gain subtle CSS depth on fine-pointer hover and press, without altering
  native select behavior, focus visibility, layout or reduced-motion preferences.

## Implementation and verification

Reuse the existing Three.js shader and the single scene frame loop. Keep particle
counts, DPR limits, lazy loading and the bundle budget unchanged. Use a semantic
avatar button, and disable its hit target/tab stop once scroll hides the avatar.

Verify mouse, touch, keyboard, repeated activation, gesture rejection, pause,
reduced motion, reverse scrolling, both themes and cleanup. Inspect visual states
and run the existing quality and browser suites. No new dependencies or hosting
configuration changes are needed. Physical-device frame rates remain unverified.

See the [verification record](../verification/interactive-sphere.md) for checks,
visual review and limitations.
