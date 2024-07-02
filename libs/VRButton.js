/**
 * @author mrdoob / http://mrdoob.com
 * @author Mugen87 / https://github.com/Mugen87
 * @author NikLever / http://niklever.com
 */

class VRButton{

	constructor( renderer, options ) {
        this.renderer = renderer;
        if (options !== undefined){
            this.onSessionStart = options.onSessionStart;
            this.onSessionEnd = options.onSessionEnd;
            this.sessionInit = options.sessionInit;
            this.sessionMode = ( options.inline !== undefined && options.inline ) ? 'inline' : 'immersive-vr';
        }else{
            this.sessionMode = 'immersive-vr';
        }
        
       if (this.sessionInit === undefined ) this.sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor' ] };
        
        if ( 'xr' in navigator ) {

			const button = document.createElement( 'button' );
			button.style.display = 'none';
            button.style.height = '40px';
            
			navigator.xr.isSessionSupported( this.sessionMode ).then( ( supported ) => {

				supported ? this.showEnterVR( button ) : this.showWebXRNotFound( button );
                if (options && options.vrStatus) options.vrStatus( supported );
                
			} );
            
            document.body.appendChild( button );

		} else {

			const message = document.createElement( 'a' );

			if ( window.isSecureContext === false ) {

				message.href = document.location.href.replace( /^http:/, 'https:' );
				message.innerHTML = 'WEBXR NEEDS HTTPS'; 

			} else {

				message.href = 'https://immersiveweb.dev/';
				message.innerHTML = 'WEBXR NOT AVAILABLE';

			}

			message.style.left = '0px';
			message.style.width = '100%';
			message.style.textDecoration = 'none';

			this.stylizeElement( message, false );
            message.style.bottom = '0px';
            message.style.opacity = '1';
            
            document.body.appendChild ( message );
            
            if (options.vrStatus) options.vrStatus( false );

		}

    }

    showEnterVR(button) {

        let currentSession = null;
        const self = this;

        this.stylizeElement(button, true, 40, true); // Increase font size to 40px and use default padding

        function onSessionStarted(session) {

            session.addEventListener('end', onSessionEnded);

            self.renderer.xr.setSession(session);
            self.stylizeElement(button, false, 12, true); // Reset font size to 12px after starting session

            button.textContent = 'EXIT VR';

            currentSession = session;

            if (self.onSessionStart !== undefined) self.onSessionStart();

        }

        function onSessionEnded() {

            currentSession.removeEventListener('end', onSessionEnded);

            self.stylizeElement(button, true, 12, true); // Reset font size to 12px after ending session
            button.textContent = 'ENTER VR';

            currentSession = null;

            if (self.onSessionEnd !== undefined) self.onSessionEnd();

        }

        //

        button.style.display = '';
        button.style.position = 'absolute'; // Position absolute to control position
        button.style.left = '50%'; // Center horizontally
        button.style.top = '50%'; // Center vertically
        button.style.transform = 'translate(-50%, -50%)'; // Center the button precisely
        button.style.width = '120px'; // Increase width of the button
        button.style.height = '120px'; // Increase height of the button
        button.style.cursor = 'pointer';
        button.innerHTML = '<i class="fas fa-vr-cardboard"></i>';
        button.style.animation = 'bounce 2s infinite'; // Apply the 'bounce' animation with a duration of 2s and infinite looping

        button.onclick = function () {

            if (currentSession === null) {

                // WebXR's requestReferenceSpace only works if the corresponding feature
                // was requested at session creation time. For simplicity, just ask for
                // the interesting ones as optional features, but be aware that the
                // requestReferenceSpace call will fail if it turns out to be unavailable.
                // ('local' is always available for immersive sessions and doesn't need to
                // be requested separately.)

                navigator.xr.requestSession(self.sessionMode, self.sessionInit).then(onSessionStarted);

            } else {

                currentSession.end();

            }

        };

        // Animation keyframes
        const keyframes = `
        @keyframes bounce {
            0%, 100% {
                transform: translate(-50%, -50%) scale(1);
            }
            50% {
                transform: translate(-50%, -50%) scale(1.1);
            }
        }
    `;

        // Inject the keyframes into the document
        const style = document.createElement('style');
        style.appendChild(document.createTextNode(keyframes));
        document.head.appendChild(style);

    }




    disableButton(button) {

        button.style.cursor = 'auto';
        button.style.opacity = '0.5';
        
        button.onmouseenter = null;
        button.onmouseleave = null;

        button.onclick = null;

    }

    showWebXRNotFound( button ) {
        this.stylizeElement( button, false );
        
        this.disableButton(button);

        button.style.display = '';
        button.style.width = '100%';
        button.style.right = '0px';
        button.style.bottom = '0px';
        button.style.border = '';
        button.style.opacity = '1';
        button.style.fontSize = '13px';
        button.textContent = 'VR NOT SUPPORTED';
        
        

    }

    stylizeElement( element, active = true, fontSize = 13, ignorePadding = false ) {

        element.style.position = 'absolute';
        element.style.bottom = '20px';
        if (!ignorePadding) element.style.padding = '12px 6px';
        element.style.border = '1px solid #fff';
        element.style.borderRadius = '4px';
        element.style.background = (active) ? 'rgba(20,150,80,1)' : 'rgba(180,20,20,1)';
        element.style.color = '#fff';
        element.style.font = `normal ${fontSize}px sans-serif`;
        element.style.textAlign = 'center';
        element.style.opacity = '0.5';
        element.style.outline = 'none';
        element.style.zIndex = '999';

    }

		

};

export { VRButton };
