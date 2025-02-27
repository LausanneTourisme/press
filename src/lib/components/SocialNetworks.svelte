<script>
  import Facebook from "$lib/Icons/Facebook.svelte";
  import Instagram from "$lib/Icons/Instagram.svelte";
  import LinkedIn from "$lib/Icons/LinkedIn.svelte";
  import Tiktok from "$lib/Icons/Tiktok.svelte";
  import Youtube from "$lib/Icons/Youtube.svelte";
  import Link from "./Link.svelte";


</script>

<Link withIcon={false} href="https://www.facebook.com/LausanneCapitaleOlympique/" class="mr-4">
	<Facebook class="w-5 md:w-[24px] h-5 md:h-[24px]" />
</Link>
<Link withIcon={false} href="https://www.tiktok.com/@thelausanner" class="mr-4">
	<Tiktok class="w-5 md:w-[24px] h-5 md:h-[24px]" />
</Link>
<Link withIcon={false} href="https://www.instagram.com/thelausanner/" class="mr-4">
	<Instagram class="w-5 md:w-[24px] h-5 md:h-[24px]" />
</Link>
<Link withIcon={false} href="https://www.youtube.com/LausanneTourisme" class="mr-4">
	<Youtube class="w-6 md:w-[20px] h-6 md:h-[20px]" />
</Link>
<Link withIcon={false} href="https://www.linkedin.com/company/lausanne-capitale-olympique" class="mr-4 -mt-1 md:-mt-2">
	<LinkedIn class="w-5 md:w-[24px] h-5 md:h-[24px]" />
</Link>
