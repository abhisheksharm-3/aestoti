<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageData, ActionData } from './$types';

    export let form: ActionData;

    let isLogin = true;

    function toggleForm() {
        isLogin = !isLogin;
    }
</script>

<div class="max-w-md mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold text-center">Welcome to GetResume</h1>
    <p class="text-sm text-center text-gray-500">
        Transform your resume into a job magnet with our AI-powered platform.
    </p>
        <form method="POST" action={isLogin ? "?/login" : "?/register"} use:enhance class="space-y-4">
            {#if !isLogin}
                <div class="grid grid-cols-2 gap-4">
                    <input name="firstName" type="text" placeholder="First Name" required class="w-full p-2 border border-gray-300 rounded" />
                    <input name="lastName" type="text" placeholder="Last Name" required class="w-full p-2 border border-gray-300 rounded" />
                </div>
            {/if}
            <input name="email" type="email" placeholder="Email" required class="w-full p-2 border border-gray-300 rounded" />
            <input name="password" type="password" placeholder="Password" required class="w-full p-2 border border-gray-300 rounded" />
            <button type="submit" class="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200">
                {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
        </form>

        {#if form?.success === false}
            <p class="text-red-500 text-center">{form.error}</p>
        {/if}

        <p class="text-center">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button on:click={toggleForm} class="text-blue-600 hover:underline ml-1">
                {isLogin ? 'Sign Up' : 'Login'}
            </button>
        </p>

        <div class="space-y-2">
            <form class="cursor-pointer w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200 flex items-center justify-center" action="?/oauth" method="post">
                <span class="mr-2">G</span> Sign in with Google
            </form>
        </div>
</div>