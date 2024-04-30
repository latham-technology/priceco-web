<template>
    <v-app>
        <v-app-bar>
            <v-app-bar-nav-icon
                v-if="loggedIn"
                variant="text"
                @click.stop="drawerIsOpen = !drawerIsOpen"
            ></v-app-bar-nav-icon>

            <v-app-bar-title>PriceCo Admin</v-app-bar-title>
        </v-app-bar>

        <v-navigation-drawer
            v-if="loggedIn"
            v-model="drawerIsOpen"
            :location="$vuetify.display.mobile ? 'bottom' : undefined"
            permanent
            :rail="railIsOpen"
            @click="railIsOpen = false"
        >
            <v-list-item nav :title="session.email">
                <template #append>
                    <v-btn
                        icon="mdi-chevron-left"
                        variant="text"
                        @click.stop="railIsOpen = !railIsOpen"
                    ></v-btn>
                </template>
            </v-list-item>

            <v-divider></v-divider>

            <v-list density="compact" nav>
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

                <template #append>
                    <v-list-item
                        prepend-icon="mdi-logout"
                        title="Logout"
                        @click="authLogout"
                    ></v-list-item>
                </template>
            </v-list>
        </v-navigation-drawer>

        <v-main>
            <div class="p-4">
                <slot />
            </div>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
const $display = useDisplay()

const drawerIsOpen = ref(!$display.mobile)
const railIsOpen = ref(false)
const { session, loggedIn } = useAuth()
</script>

<style scoped></style>
