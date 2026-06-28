"""Macros for mkdocs-macros-plugin.

Define reusable Jinja helpers usable inside any markdown page, e.g.
    {{ image('scaling.png', 'Vertical and Horizontal Scaling') }}
"""


def define_env(env):
    @env.macro
    def image(filename, alt="", style="max-width: 100%; height: auto;"):
        """Render an <img> for an asset in docs/assets/.

        The path is resolved relative to the current page so it works at
        any navigation depth (uses the plugin's per-page base_url).
        """
        base = env.variables.page.url.count("/") * "../" or "./"
        return (
            f'<img src="{base}assets/{filename}" alt="{alt}" '
            f'style="{style}">'
        )
