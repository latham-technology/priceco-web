<template>
    <v-app>
        <v-app-bar>
            <v-app-bar-nav-icon
                v-if="isLoggedIn"
                variant="text"
                @click.stop="drawerIsOpen = !drawerIsOpen"
            ></v-app-bar-nav-icon>

            <v-app-bar-title>PriceCo Admin</v-app-bar-title>
        </v-app-bar>

        <v-navigation-drawer
            v-if="isLoggedIn"
            v-model="drawerIsOpen"
            :location="$vuetify.display.mobile ? 'bottom' : undefined"
            temporary
        >
            <v-list nav>
                <v-list-item
                    prepend-icon="mdi-home"
                    title="Home"
                    to="/admin"
                >
                </v-list-item>
                <v-list-item
                    prepend-icon="mdi-file-document-multiple"
                    title="Applications"
                    to="/admin/applications"
                ></v-list-item>
                <v-list-item
                    prepend-icon="mdi-card-account-details-star"
                    title="Loyalty"
                    to="/admin/loyalty"
                ></v-list-item>
            </v-list>

            <template #append>
                <v-list-item
                    prepend-icon="mdi-logout"
                    title="Logout"
                    @click="authLogout"
                ></v-list-item>
            </template>
        </v-navigation-drawer>

        <v-main>
            <slot />
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
const drawerIsOpen = ref(false)
const isLoggedIn = useAuth().loggedIn
</script>

<style scoped></style>
